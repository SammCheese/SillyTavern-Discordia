/**
 * Discordia's boundary to SillyTavern's `@scripts/sysprompt` module.
 * Every export below is an upstream coupling that can break on ST updates —
 * add new ST internals here instead of calling `imports()` at call sites.
 */
const mod = await imports('@scripts/sysprompt');

/** Live module namespace — use to read ST bindings that get reassigned at runtime. */
export const syspromptModule = mod;

export const { system_prompts } = mod;
