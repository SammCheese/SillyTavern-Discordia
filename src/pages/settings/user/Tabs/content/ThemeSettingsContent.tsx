import Input from '../../../../../components/common/Input/Input';
import { SECTION_CARD_CLASS } from '../shared/shared';
import type { SettingsContentRenderer } from '../shared/types';
import { useThemeSettings } from '../../hooks/useThemeSettings';

const ThemeSettingsContent: SettingsContentRenderer = () => {
  const { appearanceSettings, updateSettings } = useThemeSettings();

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
              onChange={(value) => updateSettings({ blur_tint_color: value })}
            />
            <Input
              id="ui-border-color"
              label="UI Border color"
              type="color"
              value={appearanceSettings.border_color}
              onChange={(value) => updateSettings({ border_color: value })}
            />
            <Input
              id="chat-background-color"
              label="Chat Background color"
              type="color"
              value={appearanceSettings.chat_tint_color}
              onChange={(value) => updateSettings({ chat_tint_color: value })}
            />
            <Input
              id="user-message-color"
              label="User message color"
              type="color"
              value={appearanceSettings.user_mes_blur_tint_color}
              onChange={(value) =>
                updateSettings({ user_mes_blur_tint_color: value })
              }
            />
            <Input
              id="ai-message-color"
              label="AI message color"
              type="color"
              value={appearanceSettings.bot_mes_blur_tint_color}
              onChange={(value) =>
                updateSettings({ bot_mes_blur_tint_color: value })
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
              onChange={(value) => updateSettings({ main_text_color: value })}
            />
            <Input
              id="italics-text-color"
              label="Italics text color"
              type="color"
              value={appearanceSettings.italics_text_color}
              onChange={(value) =>
                updateSettings({ italics_text_color: value })
              }
            />
            <Input
              id="underlined-text-color"
              label="Underlined text color"
              type="color"
              value={appearanceSettings.underline_text_color}
              onChange={(value) =>
                updateSettings({ underline_text_color: value })
              }
            />
            <Input
              id="quote-text-color"
              label="Quote text color"
              type="color"
              value={appearanceSettings.quote_text_color}
              onChange={(value) => updateSettings({ quote_text_color: value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-300">Background opacity</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettingsContent;
