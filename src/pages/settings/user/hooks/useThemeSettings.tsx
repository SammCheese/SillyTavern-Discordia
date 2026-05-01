import { useCallback, useState } from 'react';

const { power_user, applyPowerUserSettings } =
  await imports('@scripts/powerUser');
const { saveSettingsDebounced } = await imports('@script');

const powerToAppearanceSettings = (settings: typeof power_user) => {
  return {
    theme: settings.theme,
    font_scale: settings.font_scale,
    blur_strength: settings.blur_strength,
    shadow_width: settings.shadow_width,
    chat_width: settings.chat_width,
    main_text_color: settings.main_text_color,
    italics_text_color: settings.italics_text_color,
    underline_text_color: settings.underline_text_color,
    quote_text_color: settings.quote_text_color,
    shadow_color: settings.shadow_color,
    chat_tint_color: settings.chat_tint_color,
    blur_tint_color: settings.blur_tint_color,
    border_color: settings.border_color,
    user_mes_blur_tint_color: settings.user_mes_blur_tint_color,
    bot_mes_blur_tint_color: settings.bot_mes_blur_tint_color,
  };
};

const toRGBA = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const useThemeSettings = () => {
  const [appearanceSettings, setAppearanceSettings] = useState(() =>
    powerToAppearanceSettings(power_user),
  );

  const updateSettings = useCallback(
    (newSettings: Partial<typeof appearanceSettings>) => {
      console.log('Updating settings with', newSettings);
      const convertedSettings: Partial<typeof power_user> = {};
      for (const key in newSettings) {
        if (key.includes('color') && typeof newSettings[key] === 'string') {
          // @ts-expect-error - This is the right type
          convertedSettings[key as keyof typeof power_user] = toRGBA(
            newSettings[key] as string,
            0.95,
          );
        } else {
          convertedSettings[key as keyof typeof power_user] = newSettings[
            key as keyof typeof appearanceSettings
          ] as never;
        }
      }

      console.log('Converted settings', convertedSettings);

      const updatedSettings = {
        ...appearanceSettings,
        ...newSettings,
      };
      setAppearanceSettings(updatedSettings);

      SillyTavern.getContext().powerUserSettings = {
        ...SillyTavern.getContext().powerUserSettings,
        ...convertedSettings,
      };
      saveSettingsDebounced();
      applyPowerUserSettings();
    },
    [appearanceSettings],
  );

  return {
    appearanceSettings,
    updateSettings,
  };
};
