import { useCallback, useState } from 'react';

import { power_user } from '../../../../st/powerUser';
export const powerToAppearanceSettings = (settings: typeof power_user) => {
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

export const useThemeSettings = () => {
  const [appearanceSettings, setAppearanceSettings] = useState(() =>
    powerToAppearanceSettings(power_user),
  );

  const updateSettings = useCallback(
    (newSettings: Partial<typeof appearanceSettings>) => {
      const updatedSettings = {
        ...appearanceSettings,
        ...newSettings,
      };

      setAppearanceSettings(updatedSettings);
    },
    [appearanceSettings],
  );

  return {
    appearanceSettings,
    updateSettings,
  };
};
