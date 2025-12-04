import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';

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

const { changeMainAPI, saveSettingsDebounced, eventSource, event_types } = await imports('@script');

export const useConnectionManager = () => {
  const [profiles, setProfilesState] = useState<ConnectionProfile[]>(() => {
    return getContext().extensionSettings.connectionManager.profiles || [];
  });
  const [selectedProfileId, setSelectedProfileIdState] = useState<string>(() => {
    return getContext().extensionSettings.connectionManager.selectedProfile || '';
  });

  const getSelectedProfile = (): ConnectionProfile | undefined => {
    return profiles.find((profile) => profile.id === selectedProfileId);
  };

  const getCurrentApi = useCallback((): MainAPIValues => {
    return getContext().mainApi as MainAPIValues;
  }, []);


  const setProfiles = useCallback((newProfiles: ConnectionProfile[]) => {
    setProfilesState(newProfiles);
    getContext().extensionSettings.connectionManager.profiles = newProfiles;
  }, []);

  const setSelectedProfile = useCallback((profileId: string) => {
    setSelectedProfileIdState(profileId);
    getContext().extensionSettings.connectionManager.selectedProfile = profileId;
    eventSource.emit(event_types.CONNECTION_PROFILE_LOADED, profileId);
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

  const updateCurrentProfile = (...updates: Partial<ConnectionProfile>[]) => {
    const selectedProfile = getSelectedProfile();
    if (!selectedProfile) return;

    const updatedProfile = Object.assign({}, selectedProfile, ...updates);
    const updatedProfiles = profiles.map((p) =>
      p.id === selectedProfile.id ? updatedProfile : p,
    );
    setProfiles(updatedProfiles);
    saveSettingsDebounced();
    _.debounce(() => {
      eventSource.emit(event_types.CONNECTION_PROFILE_UPDATED, updatedProfile);

    }, 300)();
  };

  // Save settings on unmount
  useEffect(() => {

    return () => {
      saveSettingsDebounced();
    };
  }, []);

  return {
    profiles,
    selectedProfileId,
    selectedProfile: getSelectedProfile(),
    updateCurrentProfile,
    getCurrentApi,
    setProfiles,
    setCurrentApi,
    setSelectedProfile,
  };
}

