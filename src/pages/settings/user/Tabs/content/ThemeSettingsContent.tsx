import Input from '../../../../../components/common/Input/Input';
import { SECTION_CARD_CLASS } from '../shared/shared';
import type { SettingsContentRenderer } from '../shared/types';
import { useThemeSettings } from '../../hooks/useThemeSettings';
import { useCallback } from 'react';
import { legacyColorUpdate } from '../../helpers/legacy';

const toRGBA = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ThemeSettingsContent: SettingsContentRenderer = () => {
  const { appearanceSettings, updateSettings } = useThemeSettings();

  const handleColorChange = useCallback(
    (key: keyof typeof appearanceSettings, value: string) => {
      const colorValue = toRGBA(value, 1);
      legacyColorUpdate(key, colorValue);
      updateSettings({ [key]: value });
    },
    [updateSettings],
  );

  return (
    <div className={SECTION_CARD_CLASS}>
      <div className="text-2xl font-gg-sans-bold mb-4">Theme</div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="text-lg font-gg-sans-bold">UI</div>
          <div className="grid grid-cols-3  gap-4">
            <Input
              id="ui-background-color"
              label="UI Background color"
              type="color"
              value={appearanceSettings.blur_tint_color}
              onChange={(value) => handleColorChange('blur_tint_color', value)}
            />
            <Input
              id="ui-border-color"
              label="UI Border color"
              type="color"
              value={appearanceSettings.border_color}
              onChange={(value) => handleColorChange('border_color', value)}
            />
            <Input
              id="chat-background-color"
              label="Chat Background color"
              type="color"
              value={appearanceSettings.chat_tint_color}
              onChange={(value) => handleColorChange('chat_tint_color', value)}
            />
            <Input
              id="user-message-color"
              label="User message color"
              type="color"
              value={appearanceSettings.user_mes_blur_tint_color}
              onChange={(value) =>
                handleColorChange('user_mes_blur_tint_color', value)
              }
            />
            <Input
              id="ai-message-color"
              label="AI message color"
              type="color"
              value={appearanceSettings.bot_mes_blur_tint_color}
              onChange={(value) =>
                handleColorChange('bot_mes_blur_tint_color', value)
              }
            />
          </div>
          <div className="text-lg font-gg-sans-bold">Text</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="main-text-color"
              label="Main text color"
              type="color"
              value={appearanceSettings.main_text_color}
              onChange={(value) => handleColorChange('main_text_color', value)}
            />
            <Input
              id="italics-text-color"
              label="Italics text color"
              type="color"
              value={appearanceSettings.italics_text_color}
              onChange={(value) =>
                handleColorChange('italics_text_color', value)
              }
            />
            <Input
              id="underlined-text-color"
              label="Underlined text color"
              type="color"
              value={appearanceSettings.underline_text_color}
              onChange={(value) =>
                handleColorChange('underline_text_color', value)
              }
            />
            <Input
              id="quote-text-color"
              label="Quote text color"
              type="color"
              value={appearanceSettings.quote_text_color}
              onChange={(value) => handleColorChange('quote_text_color', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettingsContent;
