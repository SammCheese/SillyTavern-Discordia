/**
 * Discordia's boundary to SillyTavern's `@script` module.
 * Every export below is an upstream coupling that can break on ST updates —
 * add new ST internals here instead of calling `imports()` at call sites.
 */
const mod = await imports('@script');

/** Live module namespace — use to read ST bindings that get reassigned at runtime. */
export const scriptModule = mod;

export const {
  deleteMessage,
  messageEdit,
  setEditedMessageId,
  setSendButtonState,
  eventSource,
  event_types,
  getThumbnailUrl,
  doNewChat,
  deleteCharacterChatByName,
  openCharacterChat,
  clearChat,
  characters,
  default_avatar,
  closeCurrentChat,
  isGenerating,
  deleteCharacter,
  getEntitiesList,
  getPastCharacterChats,
  getOneCharacter,
  getRequestHeaders,
  this_chid,
  getCharacters,
  saveSettingsDebounced,
  CONNECT_API_MAP,
  setOnlineStatus,
  changeMainAPI,
  amount_gen,
  max_context,
  system_avatar,
  updateRemoteChatName,
  reloadCurrentChat,
  setActiveCharacter,
  setActiveGroup,
  getCurrentChatId,
  selectCharacterById,
} = mod;
