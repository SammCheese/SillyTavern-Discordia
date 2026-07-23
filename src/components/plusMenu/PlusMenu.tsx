import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import BottomSheet from '../common/BottomSheet/BottomSheet';
import ErrorBoundary from '../common/ErrorBoundary/ErrorBoundary';
import { useBackHandler } from '../../hooks/useBackHandler';
import { useStore } from '../../utils/store';
import {
  buildPlusMenuModel,
  parsePlusMenuEntries,
  plusMenuOpenStore,
  triggerPlusMenuEntry,
  type PlusMenuCategoryModel,
  type PlusMenuEntryModel,
  type PlusMenuModel,
} from '../../services/plusMenuService';

const rowClass = (isMobile: boolean) =>
  `flex items-center gap-3 select-none cursor-pointer transition-colors hover:bg-lighter ${
    isMobile
      ? 'px-4 py-3 text-base rounded-xl'
      : 'px-3 py-1.5 text-sm rounded-lg'
  }`;

const EntryRow = ({
  entry,
  isMobile,
  onActivate,
}: {
  entry: PlusMenuEntryModel;
  isMobile: boolean;
  onActivate: (entry: PlusMenuEntryModel) => void;
}) => (
  <div
    role="menuitem"
    className={rowClass(isMobile)}
    onClick={() => onActivate(entry)}
  >
    <span className="w-5 text-center opacity-80">
      {entry.iconClass ? <i className={entry.iconClass} /> : null}
    </span>
    <span className="font-medium text-white">{entry.label}</span>
  </div>
);

const CategoryRow = ({
  category,
  isMobile,
  onOpen,
}: {
  category: PlusMenuCategoryModel;
  isMobile: boolean;
  onOpen: (name: string) => void;
}) => (
  <div
    role="menuitem"
    aria-haspopup="menu"
    className={rowClass(isMobile)}
    onClick={() => onOpen(category.name)}
  >
    <span className="w-5 text-center opacity-80">
      <i className="fa-solid fa-folder" />
    </span>
    <span className="font-medium text-white grow">{category.name}</span>
    <i className="fa-solid fa-chevron-right text-xs opacity-60" />
  </div>
);

const MenuLevel = ({
  model,
  isMobile,
  onActivate,
}: {
  model: PlusMenuModel;
  isMobile: boolean;
  onActivate: (entry: PlusMenuEntryModel) => void;
}) => {
  // Drill-in state lives here; the level unmounts when the menu closes,
  // which resets navigation to the root for the next open.
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const onOpenCategory = setActiveCategory;
  const onBack = useCallback(() => setActiveCategory(null), []);

  if (activeCategory) {
    const category = model.find(
      (m): m is PlusMenuCategoryModel =>
        m.type === 'category' && m.name === activeCategory,
    );
    return (
      <div role="menu" className="flex flex-col gap-0.5">
        <div
          className={`${rowClass(isMobile)} font-gg-sans-bold`}
          onClick={onBack}
        >
          <span className="w-5 text-center opacity-80">
            <i className="fa-solid fa-chevron-left" />
          </span>
          <span className="text-white">{activeCategory}</span>
        </div>
        <div className="divider !my-1" />
        {category?.entries.map((entry) => (
          <EntryRow
            key={entry.key}
            entry={entry}
            isMobile={isMobile}
            onActivate={onActivate}
          />
        ))}
      </div>
    );
  }

  return (
    <div role="menu" className="flex flex-col gap-0.5">
      {model.map((item) =>
        item.type === 'category' ? (
          <CategoryRow
            key={`category:${item.name}`}
            category={item}
            isMobile={isMobile}
            onOpen={onOpenCategory}
          />
        ) : (
          <EntryRow
            key={item.key}
            entry={item}
            isMobile={isMobile}
            onActivate={onActivate}
          />
        ),
      )}
    </div>
  );
};

/**
 * Discord-styled replacement for ST's "options" and "wand" menus, opened by
 * the "+" button in the chat bar (see the ui-combineChatMenu patch). Entries
 * are parsed fresh from the hidden ST menus on every open and laid out
 * according to src/config/plusMenu.ts.
 */
const PlusMenu = () => {
  const open = useStore(plusMenuOpenStore);
  const isMobile = window.innerWidth <= 768;
  const menuRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => plusMenuOpenStore.set(false), []);

  // Parsed fresh on every open — extensions add/toggle entries at runtime
  const model = useMemo<PlusMenuModel>(
    () => (open ? buildPlusMenuModel(parsePlusMenuEntries()) : []),
    [open],
  );

  const anchor = useMemo<DOMRect | null>(
    () =>
      open
        ? (document
            .getElementById('extras_menu_button')
            ?.getBoundingClientRect() ?? null)
        : null,
    [open],
  );

  useEffect(() => {
    if (!open || isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, isMobile, close]);

  useBackHandler(open && !isMobile, close);

  // Position above the "+" button with top/left after measuring. Never use
  // bottom/right insets here: ST transforms <html> (see
  // st-html-transform-quirk) and at <=1000px its fixed body collapses the
  // html box to 0 height, which sends bottom-anchored fixed elements off
  // the top of the viewport. The observer repositions when drill-in
  // navigation changes the menu height.
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!open || isMobile || !anchor || !el) return;

    const position = () => {
      const top = Math.max(8, anchor.top - el.offsetHeight - 8);
      const left = Math.min(
        Math.max(8, anchor.left),
        window.innerWidth - el.offsetWidth - 8,
      );
      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
      el.style.visibility = 'visible';
    };

    position();

    const observer = new ResizeObserver(position);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, isMobile, anchor]);

  const handleActivate = useCallback(
    (entry: PlusMenuEntryModel) => {
      triggerPlusMenuEntry(entry);
      close();
    },
    [close],
  );

  const level = (
    <MenuLevel model={model} isMobile={isMobile} onActivate={handleActivate} />
  );

  if (isMobile) {
    return (
      <ErrorBoundary>
        {open && (
          <BottomSheet open={open} onClose={close}>
            {level}
          </BottomSheet>
        )}
      </ErrorBoundary>
    );
  }

  if (!open || !anchor) return null;

  const container = document.getElementById('discordia-root') || document.body;

  return (
    <ErrorBoundary>
      {createPortal(
        // Full-viewport click-away layer; explicit w-dvw h-dvh + inline
        // zIndex, see st-html-transform-quirk / #discordia-root > * notes
        <div
          className="fixed top-0 left-0 w-dvw h-dvh"
          style={{ zIndex: 60 }}
          onClick={close}
          onContextMenu={(e) => {
            e.preventDefault();
            close();
          }}
        >
          <div
            ref={menuRef}
            role="menu"
            className="fixed min-w-[240px] max-w-[340px] rounded-lg border border-darker shadow-lg p-1.5 overflow-y-auto"
            style={{
              visibility: 'hidden', // shown once positioned (useLayoutEffect)
              maxHeight: '60dvh',
              backgroundColor: 'var(--SmartThemeBlurTintColor, #2a2a2a)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {level}
          </div>
        </div>,
        container,
      )}
    </ErrorBoundary>
  );
};

export default memo(PlusMenu);
