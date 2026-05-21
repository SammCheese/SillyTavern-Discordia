import { memo, useCallback } from 'react';
import { useSettings } from '../../../../providers/discordiaSettingsProvider';
import type { UserSettingsItem } from './Settings';
import { settingsContentRegistry } from './shared';
import DefaultSettingsContent from './content/DefaultSettingsContent';
import type { SettingsShape } from './shared/types';

const SettingsContent = ({ item }: { item: UserSettingsItem }) => {
  const { settings, saveSettings } = useSettings();

  const updateAppearance = useCallback(() => {
    console.log('stub');
  }, []);

  const updateBehavior = useCallback(
    (patch: Partial<SettingsShape['behavior']>) => {
      saveSettings({
        behavior: {
          ...settings.behavior,
          ...patch,
        },
      });
    },
    [saveSettings, settings.behavior],
  );

  const Renderer = settingsContentRegistry[item.id] ?? DefaultSettingsContent;

  return (
    <Renderer
      item={item}
      settings={settings}
      updateAppearance={updateAppearance}
      updateBehavior={updateBehavior}
    />
  );
};

export default memo(SettingsContent);
