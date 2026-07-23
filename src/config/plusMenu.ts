/**
 * Layout of the "+" menu in the chat bar.
 *
 * Entries reference the DOM id of the original SillyTavern menu item
 * (from `#options` or `#extensionsMenu`), without the leading '#'.
 * Anything not listed here is collected wherever REST_ENTRIES is placed
 * (or appended to the menu root if REST_ENTRIES is absent).
 *
 * - `{ id, name? }`            → single entry, optional display-name override
 * - `{ category: true, ... }`  → submenu with its own entries
 * - `REST_ENTRIES`             → placeholder for all unlisted entries
 */

export interface PlusMenuEntryConfig {
  /** DOM id of the original menu element (no '#') */
  id: string;
  /** Overrides the label parsed from the original element */
  name?: string;
}

export interface PlusMenuCategoryConfig {
  category: true;
  category_name: string;
  subentries: PlusMenuConfigItem[];
}

export type PlusMenuConfigItem = PlusMenuEntryConfig | PlusMenuCategoryConfig;

/** Collects every entry that no other config item claimed. */
export const REST_ENTRIES: PlusMenuEntryConfig = { id: '*' };

export const isCategoryConfig = (
  item: PlusMenuConfigItem,
): item is PlusMenuCategoryConfig =>
  (item as PlusMenuCategoryConfig).category === true;

export const plusMenuConfig: PlusMenuConfigItem[] = [
  // Root level: the frequent actions
  { id: 'option_continue' },
  { id: 'option_regenerate' },
  {
    id: 'attachFile',
    name: 'Attach File',
  },
  {
    category: true,
    category_name: 'Chat',
    subentries: [
      { id: 'option_delete_mes' },
      { id: 'option_select_chat', name: 'Manage Chats' },
      { id: 'option_start_new_chat' },
      { id: 'option_new_bookmark', name: 'Create Checkpoint' },
      { id: 'option_convert_to_group' },
      { id: 'option_back_to_main' },
      { id: 'option_close_chat' },
    ],
  },
  {
    category: true,
    category_name: 'Tools',
    subentries: [
      { id: 'option_impersonate' },
      { id: 'option_toggle_AN' },
      { id: 'option_toggle_CFG' },
      { id: 'option_toggle_logprobs' },
    ],
  },
  {
    category: true,
    category_name: 'Extensions',
    subentries: [REST_ENTRIES],
  },
];
