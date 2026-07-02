/**
 * Discordia's boundary to SillyTavern's `@scripts/worldInfo` module.
 * Every export below is an upstream coupling that can break on ST updates —
 * add new ST internals here instead of calling `imports()` at call sites.
 */
const mod = await imports('@scripts/worldInfo');

/** Live module namespace — use to read ST bindings that get reassigned at runtime. */
export const worldInfoModule = mod;

export const { getWorldInfoSettings, world_names } = mod;
