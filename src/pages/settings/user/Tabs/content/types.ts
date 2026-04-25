import type { ReactNode } from 'react';
import type { useSettings } from '../../../../../providers/discordiaSettingsProvider';
import type { UserSettingsItem } from '../Settings';

export type SettingsShape = ReturnType<typeof useSettings>['settings'];

export interface SettingsContentContext {
  item: UserSettingsItem;
  settings: SettingsShape;
  updateAppearance: (patch: Partial<SettingsShape['appearance']>) => void;
  updateBehavior: (patch: Partial<SettingsShape['behavior']>) => void;
}

export type SettingsContentRenderer = (
  ctx: SettingsContentContext,
) => ReactNode;
