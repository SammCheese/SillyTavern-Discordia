import AccountSettingsContent from '../content/AccountSettingsContent';
import AdminPanelSettingsContent from '../content/AdminPanelSettingsContent';
import AdvancedAppearanceSettingsContent from '../content/AdvancedAppearanceSettingsContent';
import DiscordiaSettingsContent from '../content/DiscordiaSettingsContent';
import MessageDisplaySettingsContent from '../content/MessageDisplaySettingsContent';
import ThemeSettingsContent from '../content/ThemeSettingsContent';
import UiBehaviorSettingsContent from '../content/UiBehaviorSettingsContent';
import type { SettingsContentRenderer } from './types';

export const settingsContentRegistry: Record<string, SettingsContentRenderer> =
  {
    account: AccountSettingsContent,
    'admin-panel': AdminPanelSettingsContent,
    discordia: DiscordiaSettingsContent,
    theme: ThemeSettingsContent,
    'ui-behavior': UiBehaviorSettingsContent,
    'message-display': MessageDisplaySettingsContent,
    'advanced-appearance': AdvancedAppearanceSettingsContent,
  };
