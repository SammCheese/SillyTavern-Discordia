import { SECTION_CARD_CLASS } from '../shared/shared';
import type { SettingsContentRenderer } from '../shared/types';
import { useThemeSettings } from '../../hooks/useThemeSettings';
import { useCallback } from 'react';
import { legacyColorUpdate } from '../../helpers/legacy';
import PopoverColorPicker from '../../../../../components/common/ColorPicker/ColorPicker';

const ColorInput = ({ id, label, value, onChange }) => (
  <div className="flex items-center gap-2">
    <label htmlFor={id} className="block text-sm font-medium">
      {label}
    </label>
    <PopoverColorPicker color={value} onChangeEnd={onChange} />
  </div>
);

const ThemeSettingsContent: SettingsContentRenderer = () => {
  const { appearanceSettings, updateSettings } = useThemeSettings();

  const handleColorChange = useCallback(
    (key: keyof typeof appearanceSettings, value: string) => {
      legacyColorUpdate(key, value);
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
          <div className="grid grid-cols-2 gap-4 mb-4">
            <ColorInput
              label={'UI Background color'}
              id={'ui-background-color'}
              value={appearanceSettings.blur_tint_color}
              onChange={(value) => handleColorChange('blur_tint_color', value)}
            />
            <ColorInput
              label={'UI Border color'}
              id={'ui-border-color'}
              value={appearanceSettings.border_color}
              onChange={(value) => handleColorChange('border_color', value)}
            />
            <ColorInput
              label={'Chat Background color'}
              id={'chat-background-color'}
              value={appearanceSettings.chat_tint_color}
              onChange={(value) => handleColorChange('chat_tint_color', value)}
            />
          </div>
          <div className="text-lg font-gg-sans-bold">Messages</div>
          <div className="grid gap-4 mb-4">
            <ColorInput
              label={'User message color'}
              id={'user-message-color'}
              value={appearanceSettings.user_mes_blur_tint_color}
              onChange={(value) =>
                handleColorChange('user_mes_blur_tint_color', value)
              }
            />
            <ColorInput
              label={'AI message color'}
              id={'ai-message-color'}
              value={appearanceSettings.bot_mes_blur_tint_color}
              onChange={(value) =>
                handleColorChange('bot_mes_blur_tint_color', value)
              }
            />
          </div>
          <div className="text-lg font-gg-sans-bold">Text</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ColorInput
              label={'Main text color'}
              id={'main-text-color'}
              value={appearanceSettings.main_text_color}
              onChange={(value) => handleColorChange('main_text_color', value)}
            />
            <ColorInput
              label={'Italics text color'}
              id={'italics-text-color'}
              value={appearanceSettings.italics_text_color}
              onChange={(value) =>
                handleColorChange('italics_text_color', value)
              }
            />
            <ColorInput
              label={'Underlined text color'}
              id={'underlined-text-color'}
              value={appearanceSettings.underline_text_color}
              onChange={(value) =>
                handleColorChange('underline_text_color', value)
              }
            />
            <ColorInput
              label={'Quote text color'}
              id={'quote-text-color'}
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
