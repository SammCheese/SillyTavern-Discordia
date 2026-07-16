/**
 * Discordia's boundary to SillyTavern's `@scripts/textGenSettings` module.
 * Every export below is an upstream coupling that can break on ST updates —
 * add new ST internals here instead of calling `imports()` at call sites.
 */
const mod = await imports('@scripts/textGenSettings');

/** Live module namespace — use to read ST bindings that get reassigned at runtime. */
export const textGenSettingsModule = mod;

export const {
  getTextGenServer,
  textgenerationwebui_settings,
  textgen_types,
  SERVER_INPUTS,
  textgenerationwebui_preset_names,
  textgenerationwebui_presets,
} = mod;
