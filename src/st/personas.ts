/**
 * Discordia's boundary to SillyTavern's `@scripts/personas` module.
 * Every export below is an upstream coupling that can break on ST updates —
 * add new ST internals here instead of calling `imports()` at call sites.
 */
const mod = await imports('@scripts/personas');

/** Live module namespace — use to read ST bindings that get reassigned at runtime. */
export const personasModule = mod;

export const { user_avatar, setUserAvatar, getUserAvatar, getUserAvatars } =
  mod;
