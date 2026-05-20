import { useCallback } from 'react';
import { useSettings } from '../../../../../providers/discordiaSettingsProvider';
import { SECTION_CARD_CLASS } from '../shared/shared';
import type { SettingsContentRenderer } from '../shared/types';
import Checkbox from '../../../../../components/common/Checkbox/Checkbox';

const DiscordiaSettingsContent: SettingsContentRenderer = ({ item }) => {
  const { settings, saveSettings } = useSettings();

  const handleToggle = useCallback(
    (key: keyof typeof settings.behavior) => {
      const newValue = !settings.behavior[key];
      saveSettings({
        behavior: {
          ...settings.behavior,
          [key]: newValue,
        },
      });
    },
    [settings, saveSettings],
  );

  return (
    <div className={SECTION_CARD_CLASS}>
      <div className="text-2xl font-gg-sans-bold mb-2">{item.label}</div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <Checkbox
            label="Keep chat open when clicking Home button"
            checked={!settings.behavior.closeChatOnHomeButton}
            onChange={() => handleToggle('closeChatOnHomeButton')}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscordiaSettingsContent;
