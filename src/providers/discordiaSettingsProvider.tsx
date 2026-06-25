import { createContext, use, useCallback, useMemo, useState } from 'react';

const SettingsContext = createContext<SettingsContextType | null>(null);

interface SettingsProviderProps {
  children: React.ReactNode;
}

interface SettingsContextType {
  saveSettings: (settings: Partial<Settings>) => void;
  getSettings: () => Settings;
  settings: Settings;
}

interface Settings {
  behavior: {
    legacyEditing: boolean;
    closeChatOnHomeButton: boolean;
  };
}

const DefaultSettings: Settings = {
  behavior: {
    legacyEditing: false,
    closeChatOnHomeButton: false,
  },
};

const { saveSettingsDebounced } = await imports('@script');

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [discordiaSettings, setDiscordiaSettings] = useState<Settings>(() => {
    const existingSettings =
      SillyTavern.getContext().extensionSettings.discordia || {};

    const newSettings = {
      ...DefaultSettings,
      behavior: {
        ...DefaultSettings.behavior,
        ...existingSettings.behavior,
      },
    };

    return newSettings;
  });

  const saveSettings = useCallback((settings: Partial<Settings>) => {
    const existingSettings =
      SillyTavern.getContext().extensionSettings.discordia || {};

    const newSettings = {
      ...DefaultSettings,
      behavior: {
        ...DefaultSettings.behavior,
        ...existingSettings.behavior,
        ...settings.behavior,
      },
    };

    setDiscordiaSettings(newSettings);
    SillyTavern.getContext().extensionSettings.discordia = newSettings;
    saveSettingsDebounced();
  }, []);

  const getSettings = useCallback(() => {
    return discordiaSettings;
  }, [discordiaSettings]);

  const contextValue = useMemo(() => {
    return {
      settings: discordiaSettings,
      saveSettings,
      getSettings,
    };
  }, [discordiaSettings, saveSettings, getSettings]);

  return <SettingsContext value={contextValue}>{children}</SettingsContext>;
};

export const useSettings = () => {
  const context = use(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
