/**
 * Discordia's boundary to SillyTavern's `@scripts/powerUser` module.
 * Every export below is an upstream coupling that can break on ST updates —
 * add new ST internals here instead of calling `imports()` at call sites.
 */
const mod = await imports('@scripts/powerUser');

/** Live module namespace — use to read ST bindings that get reassigned at runtime. */
export const powerUserModule = mod;

export const { persona_description_positions, power_user } = mod;
