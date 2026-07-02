/**
 * Discordia's boundary to SillyTavern's `@scripts/utils` module.
 * Every export below is an upstream coupling that can break on ST updates —
 * add new ST internals here instead of calling `imports()` at call sites.
 */
const mod = await imports('@scripts/utils');

/** Live module namespace — use to read ST bindings that get reassigned at runtime. */
export const utilsModule = mod;

export const {
  isValidUrl,
  ensureImageFormatSupported,
  sortMoments,
  timestampToMoment,
  equalsIgnoreCaseAndAccents,
  isDataURL,
} = mod;
