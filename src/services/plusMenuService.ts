import {
  isCategoryConfig,
  plusMenuConfig,
  type PlusMenuConfigItem,
} from '../config/plusMenu';
import { createStore } from '../utils/store';

/** Opened/closed state of the "+" menu; set by the chat-bar button patch. */
export const plusMenuOpenStore = createStore(false);

export interface ParsedPlusMenuEntry {
  /** Stable key: element id, or a slug of the label for id-less entries */
  key: string;
  label: string;
  iconClass: string | null;
  element: HTMLElement;
}

export interface PlusMenuEntryModel extends ParsedPlusMenuEntry {
  type: 'entry';
}

export interface PlusMenuCategoryModel {
  type: 'category';
  name: string;
  entries: PlusMenuEntryModel[];
}

export type PlusMenuModel = (PlusMenuEntryModel | PlusMenuCategoryModel)[];

const REST_ID = '*';

/**
 * ST toggles menu entries contextually with inline display or the
 * displayNone class; the menus themselves are always display:none, so
 * computed visibility is useless here.
 */
const isEntryHidden = (el: HTMLElement, menuRoot: HTMLElement): boolean => {
  let node: HTMLElement | null = el;
  while (node && node !== menuRoot) {
    if (
      node.classList.contains('displayNone') ||
      node.style.display === 'none'
    ) {
      return true;
    }
    node = node.parentElement;
  }
  return false;
};

const parseEntry = (
  el: HTMLElement,
  menuRoot: HTMLElement,
): ParsedPlusMenuEntry | null => {
  if (isEntryHidden(el, menuRoot)) return null;

  const label = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (!label) return null;

  const icon = el.querySelector('i[class*="fa-"]');
  return {
    key: el.id || `label:${label.toLowerCase()}`,
    label,
    iconClass: icon?.className ?? null,
    element: el,
  };
};

/**
 * Reads the live entries out of ST's `#options` and `#extensionsMenu`.
 * Parsed fresh on every menu open — extensions add and toggle entries at
 * runtime.
 */
export const parsePlusMenuEntries = (): ParsedPlusMenuEntry[] => {
  const entries: ParsedPlusMenuEntry[] = [];

  const options = document.getElementById('options');
  if (options) {
    for (const el of options.querySelectorAll<HTMLElement>(
      '.options-content > a',
    )) {
      const parsed = parseEntry(el, options);
      if (parsed) entries.push(parsed);
    }
  }

  const extensionsMenu = document.getElementById('extensionsMenu');
  if (extensionsMenu) {
    // Entries either sit inside .extension_container wrappers or are
    // appended directly to the menu by third-party extensions.
    const candidates = extensionsMenu.querySelectorAll<HTMLElement>(
      ':scope > .extension_container > *, :scope > :not(.extension_container)',
    );
    for (const el of candidates) {
      const parsed = parseEntry(el, extensionsMenu);
      if (parsed) entries.push(parsed);
    }
  }

  return entries;
};

/**
 * Applies the plusMenu config to the parsed entries: pinned entries and
 * categories in configured order, everything unclaimed lands at the REST
 * placeholder (or the menu root if the config has none).
 */
export const buildPlusMenuModel = (
  entries: ParsedPlusMenuEntry[],
  config: PlusMenuConfigItem[] = plusMenuConfig,
): PlusMenuModel => {
  const byId = new Map(entries.filter((e) => e.key).map((e) => [e.key, e]));
  const claimed = new Set<string>();

  // First pass: find every explicitly referenced id so REST knows the rest
  const collectClaims = (items: PlusMenuConfigItem[]) => {
    for (const item of items) {
      if (isCategoryConfig(item)) collectClaims(item.subentries);
      else if (item.id !== REST_ID) claimed.add(item.id);
    }
  };
  collectClaims(config);

  const restEntries = (): PlusMenuEntryModel[] =>
    entries
      .filter((e) => !claimed.has(e.key))
      .map((e) => ({ ...e, type: 'entry' as const }));

  let restUsed = false;

  const buildLevel = (items: PlusMenuConfigItem[]): PlusMenuModel => {
    const level: PlusMenuModel = [];

    for (const item of items) {
      if (isCategoryConfig(item)) {
        const sub = buildLevel(item.subentries).filter(
          (m): m is PlusMenuEntryModel => m.type === 'entry',
        );
        if (sub.length > 0) {
          level.push({
            type: 'category',
            name: item.category_name,
            entries: sub,
          });
        }
        continue;
      }

      if (item.id === REST_ID) {
        if (!restUsed) {
          restUsed = true;
          level.push(...restEntries());
        }
        continue;
      }

      const entry = byId.get(item.id);
      if (!entry) continue; // entry hidden or not present right now

      level.push({
        ...entry,
        label: item.name ?? entry.label,
        type: 'entry',
      });
    }

    return level;
  };

  const model = buildLevel(config);
  if (!restUsed) model.push(...restEntries());

  return model;
};

/** Re-dispatches a click to the original (hidden) ST menu element. */
export const triggerPlusMenuEntry = (entry: ParsedPlusMenuEntry) => {
  entry.element.dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true }),
  );
};
