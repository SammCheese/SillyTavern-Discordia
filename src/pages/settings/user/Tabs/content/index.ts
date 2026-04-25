import AccountSettingsContent from './AccountSettingsContent';
import AdminPanelSettingsContent from './AdminPanelSettingsContent';
import AdvancedAppearanceSettingsContent from './AdvancedAppearanceSettingsContent';
import MessageDisplaySettingsContent from './MessageDisplaySettingsContent';
import ThemeSettingsContent from './ThemeSettingsContent';
import UiBehaviorSettingsContent from './UiBehaviorSettingsContent';
import type { SettingsContentRenderer } from './types';

export const settingsContentRegistry: Record<string, SettingsContentRenderer> =
  {
    account: AccountSettingsContent,
    'admin-panel': AdminPanelSettingsContent,
    theme: ThemeSettingsContent,
    'ui-behavior': UiBehaviorSettingsContent,
    'message-display': MessageDisplaySettingsContent,
    'advanced-appearance': AdvancedAppearanceSettingsContent,
  };
