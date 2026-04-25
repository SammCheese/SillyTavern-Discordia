import { memo, useCallback } from 'react';
import { useSettings } from '../../../../providers/discordiaSettingsProvider';
import type { UserSettingsItem } from './Settings';
import { settingsContentRegistry } from './content';
import DefaultSettingsContent from './content/DefaultSettingsContent';
import type { SettingsShape } from './content/types';

const SettingsContent = ({ item }: { item: UserSettingsItem }) => {
  const { settings, saveSettings } = useSettings();

  const updateAppearance = useCallback(
    (patch: Partial<SettingsShape['appearance']>) => {
      saveSettings({
        appearance: {
          ...settings.appearance,
          ...patch,
        },
      });
    },
    [saveSettings, settings.appearance],
  );

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

  const renderer = settingsContentRegistry[item.id] ?? DefaultSettingsContent;

  return renderer({
    item,
    settings,
    updateAppearance,
    updateBehavior,
  });
};

export default memo(SettingsContent);
