/**
 * Discordia's boundary to SillyTavern's `@scripts/extensions` module.
 * Every export below is an upstream coupling that can break on ST updates —
 * add new ST internals here instead of calling `imports()` at call sites.
 */
const mod = await imports('@scripts/extensions');

/** Live module namespace — use to read ST bindings that get reassigned at runtime. */
export const extensionsModule = mod;

export const {
  deleteExtension,
  installExtension,
  enableExtension,
  disableExtension,
  findExtension,
} = mod;
