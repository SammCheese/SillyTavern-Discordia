import {
  createContext,
  useCallback,
  use,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { type ContextMenuItem } from '../components/common/ContextMenuEntry/ContextMenuEntry';
import ContextMenuList from '../components/common/ContextMenuEntry/ContextMenuEntryList';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';
import { useBackHandler } from '../hooks/useBackHandler';

export const ContextMenuContext = createContext<{
  showContextMenu: (e: MouseEvent, items: ContextMenuItem[]) => void;
  closeContextMenu: () => void;
}>({
  showContextMenu: () => {},
  closeContextMenu: () => {},
});

export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [menuItems, setMenuItems] = useState<ContextMenuItem[] | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isMobile = window.innerWidth <= 768;

  const closeContextMenu = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setIsRendered(false);
    }, 300);
  }, []);

  const handleContextMenu = useCallback(
    (e: MouseEvent, items: ContextMenuItem[]) => {
      e.preventDefault();
      e.stopPropagation();

      if (window.getSelection) {
        window.getSelection()?.removeAllRanges();
      }

      const clickX = e.clientX;
      const clickY = e.clientY;

      setClickPosition({ x: clickX, y: clickY });
      setMenuItems(items);
      setIsRendered(true);

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setIsVisible(true);
        }),
      );
    },
    [],
  );

  useLayoutEffect(() => {
    if (isRendered && menuRef.current && !isMobile && clickPosition) {
      const el = menuRef.current;
      const { offsetWidth: rootW, offsetHeight: rootH } = el;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      const { x, y } = clickPosition;

      const rightOverflow = x + rootW > screenW;
      const bottomOverflow = y + rootH > screenH;

      const finalX = rightOverflow ? x - rootW : x;
      const finalY = bottomOverflow ? y - rootH : y;

      el.style.left = `${finalX}px`;
      el.style.top = `${finalY}px`;
    }
  }, [isRendered, isMobile, clickPosition, menuItems]);

  useEffect(() => {
    if (!isVisible) return;

    const handleClick = () => isVisible && closeContextMenu();
    const handleResize = () => isVisible && closeContextMenu();
    const handleScroll = () => isVisible && closeContextMenu();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isVisible) closeContextMenu();
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('contextmenu', handleClick);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('contextmenu', handleClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, closeContextMenu]);

  const contextValue = useMemo(
    () => ({
      showContextMenu: handleContextMenu,
      closeContextMenu,
    }),
    [handleContextMenu, closeContextMenu],
  );

  const styles = {
    mobile: {
      container: `absolute h-fit z-70 bg-base-discordia border-t border-darker rounded-t-xl shadow-2xl p-4 pb-8
        transform transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}`,
    },
    desktop: {
      container:
        'fixed z-70 min-w-[180px] max-w-[300px] bg-base-discordia border border-darker rounded-lg shadow-lg p-1 animate-in fade-in zoom-in-95 duration-100',
    },
  };

  const handleDefaultContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  useBackHandler(isVisible, closeContextMenu);

  return (
    <ErrorBoundary>
      <ContextMenuContext value={contextValue}>
        {isRendered &&
          createPortal(
            <div
              id="context-menu-backdrop"
              className={`z-60 fixed top-0 left-0 w-dvw h-dvh
              ${isMobile ? (isVisible ? 'bg-black/60 backdrop-blur-[2px] opacity-100' : 'bg-black/0 opacity-0') : ''}`}
            >
              <div
                ref={menuRef}
                style={
                  isMobile
                    ? { bottom: 0, left: 0, width: '100%' }
                    : {
                        position: 'fixed',
                        opacity: isVisible ? 1 : 0,
                      }
                }
                className={`discordia-context-menu ${isMobile ? styles.mobile.container : styles.desktop.container} `}
                onClick={handleClick}
                onContextMenu={handleDefaultContextMenu}
              >
                <ContextMenuList items={menuItems || []} isMobile={isMobile} />
              </div>
            </div>,
            document.body,
          )}
        {children}
      </ContextMenuContext>
    </ErrorBoundary>
  );
}

export default ContextMenuProvider;

export const useContextMenu = () => {
  const context = use(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};
