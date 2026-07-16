import { saveSettingsDebounced } from '../st/script';

export interface DiscordiaSettings {
  hiddenCharacters: string[];
  sidebar: {
    characterOrders: string[];
    folders: Folder[];
  };
}

type Folder = {
  name: string;
  characterIds: string[];
};

const DEFAULT_DISCORDIA_SETTINGS: DiscordiaSettings = {
  hiddenCharacters: [],
  sidebar: {
    characterOrders: [],
    folders: [],
  },
};

export const getDiscordiaSettings = (): DiscordiaSettings => {
  const settings =
    SillyTavern.getContext().extensionSettings?.discordia ||
    DEFAULT_DISCORDIA_SETTINGS;

  return {
    ...DEFAULT_DISCORDIA_SETTINGS,
    ...settings,
  };
};

export const updateDiscordiaSettings = (
  newSettings: Partial<DiscordiaSettings>,
) => {
  const currentSettings =
    SillyTavern.getContext().extensionSettings?.discordia ||
    DEFAULT_DISCORDIA_SETTINGS;

  const updatedSettings = {
    ...currentSettings,
    ...newSettings,
  };

  SillyTavern.getContext().extensionSettings.discordia = updatedSettings;

  saveSettingsDebounced();
};
