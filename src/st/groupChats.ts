/**
 * Discordia's boundary to SillyTavern's `@scripts/groupChats` module.
 * Every export below is an upstream coupling that can break on ST updates —
 * add new ST internals here instead of calling `imports()` at call sites.
 */
const mod = await imports('@scripts/groupChats');

/** Live module namespace — use to read ST bindings that get reassigned at runtime. */
export const groupChatsModule = mod;

export const {
  deleteGroup,
  deleteGroupChatByName,
  openGroupChat,
  getGroupPastChats,
  hideMutedSprites,
  is_group_automode_enabled,
  groups,
  renameGroupChat,
  openGroupById,
} = mod;
