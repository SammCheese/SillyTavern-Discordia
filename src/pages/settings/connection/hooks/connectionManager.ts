import React, { useCallback } from 'react';

export interface ConnectionProfile {
  id: string;
  mode: string;
  name?: string;
  api?: string;
  preset?: string;
  model?: string;
  proxy?: string;
  instruct?: string;
  context?: string;
  'instruct-state'?: string;
  tokenizer?: string;
  'stop-strings'?: string;
  'start-reply-with'?: string;
  'reasoning-template'?: string;
  'prompt-post-processing'?: string;
  sysprompt?: string;
  'sysprompt-state'?: string;
  'api-url'?: string;
  'secret-id'?: string;
  'regex-preset'?: string;
  exclude?: string[];
}

/*interface ConnectionManagerContextType {
  profiles: ConnectionProfile[];
  selectedProfile: string;
}*/
export type MainAPIValues =
  | 'kobold'
  | 'openai'
  | 'novel'
  | 'textgenerationwebui'
  | 'koboldhorde';

const { getContext } = SillyTavern;

const { changeMainAPI, saveSettingsDebounced } = await imports('@script');

export const useConnectionManager = () => {

  const [profiles, setProfilesState] = React.useState<ConnectionProfile[]>(() => {
    return getContext().extensionSettings.connectionManager.profiles || [];
  });
  const [selectedProfileId, setSelectedProfileIdState] = React.useState<string>(() => {
    return getContext().extensionSettings.connectionManager.selectedProfile || '';
  });



  const getSelectedProfile = (): ConnectionProfile | undefined => {
    return profiles.find((profile) => profile.id === selectedProfileId);
  };

  const getCurrentApi = React.useCallback((): MainAPIValues => {
    return getContext().mainApi as MainAPIValues;
  }, []);


  const setProfiles = useCallback((newProfiles: ConnectionProfile[]) => {
    setProfilesState(newProfiles);
    getContext().extensionSettings.connectionManager.profiles = newProfiles;
    saveSettingsDebounced();
  }, []);

  const setSelectedProfile = useCallback((profileId: string) => {
    setSelectedProfileIdState(profileId);
    getContext().extensionSettings.connectionManager.selectedProfile = profileId;
    saveSettingsDebounced();
  }, []);

  const setCurrentApi = useCallback((api: MainAPIValues) => {
    // Fallback in case the change hasnt hit main yet
    try {
      if (changeMainAPI.length === 1) {
        // @ts-expect-error shut up
        changeMainAPI(api);
      } else {
        throw new Error('changeMainAPI has unexpected signature, attempting fallback');
      }
    } catch {
      console.warn('Failed to change main API via function, falling back to DOM');
      // Whoever made the api setting DOM dependent
      // can be lucky I'm not a violent person.
      $('#main_api').val(api).trigger('change');
    }
    saveSettingsDebounced();
  }, []);

  return {
    profiles,
    selectedProfileId,
    selectedProfile: getSelectedProfile(),
    getCurrentApi,
    setProfiles,
    setCurrentApi,
    setSelectedProfile,
  };
}

