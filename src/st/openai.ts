/**
 * Discordia's boundary to SillyTavern's `@scripts/openai` module.
 * Every export below is an upstream coupling that can break on ST updates —
 * add new ST internals here instead of calling `imports()` at call sites.
 */
const mod = await imports('@scripts/openai');

/** Live module namespace — use to read ST bindings that get reassigned at runtime. */
export const openaiModule = mod;

export const {
  chat_completion_sources,
  oai_settings,
  custom_prompt_post_processing_types,
  settingsToUpdate,
} = mod;
