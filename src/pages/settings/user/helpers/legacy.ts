import { powerToAppearanceSettings } from './../hooks/useThemeSettings';

type AppearanceSettingKey = keyof ReturnType<typeof powerToAppearanceSettings>;

// Hatred.
export const legacyColorUpdate = (
  type: AppearanceSettingKey,
  color: string,
) => {
  let elem: HTMLElement | null = null;

  if (type === 'main_text_color') {
    elem = document.getElementById('main-text-color-picker');
  }
  if (type === 'italics_text_color') {
    elem = document.getElementById('italics-color-picker');
  }
  if (type === 'underline_text_color') {
    elem = document.getElementById('underline-color-picker');
  }
  if (type === 'quote_text_color') {
    elem = document.getElementById('quote-color-picker');
  }
  if (type === 'blur_tint_color') {
    elem = document.getElementById('blur-tint-color-picker');
  }
  if (type === 'chat_tint_color') {
    elem = document.getElementById('chat-tint-color-picker');
  }
  if (type === 'user_mes_blur_tint_color') {
    elem = document.getElementById('user-mes-blur-tint-color-picker');
  }
  if (type === 'bot_mes_blur_tint_color') {
    elem = document.getElementById('bot-mes-blur-tint-color-picker');
  }
  if (type === 'shadow_color') {
    elem = document.getElementById('shadow-color-picker');
  }
  if (type === 'border_color') {
    elem = document.getElementById('border-color-picker');
  }

  if (elem) {
    const event = new CustomEvent('change', {
      detail: { rgba: color },
      bubbles: true,
    });
    elem.dispatchEvent(event);
  }
};
