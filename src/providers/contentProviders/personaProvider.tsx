import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DISCORDIA_EVENTS } from '../../events/eventTypes';

export const PersonaContext = createContext<{
  personas: Persona[];
  currentPersona?: Persona | null;
  setPersona: (persona: Persona) => void;
}>({
  personas: [],
  currentPersona: null,
  setPersona: () => {},
});

const { eventSource, event_types, getThumbnailUrl, saveSettingsDebounced } =
  await imports('@script');
const { getUserAvatars, setUserAvatar, user_avatar } =
  await imports('@scripts/personas');
const { power_user } = await imports('@scripts/powerUser');

interface PersonaProviderProps {
  children: ReactNode;
}

export const PersonaProvider = ({ children }: PersonaProviderProps) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(() => {
    const avatar = user_avatar || 'user-default.png';
    const personaName =
      SillyTavern.getContext().powerUserSettings.personas?.[avatar] || avatar;
    return {
      name: personaName || 'Unknown',
      avatar,
      avatarURL: getThumbnailUrl('persona', avatar),
    } as Persona;
  });

  const handlePersonaUpdate = useCallback(async () => {
    const { user_avatar } = await imports('@scripts/personas');
    const persona = personas.find((p) => p.avatar === user_avatar);
    setCurrentPersona(persona || null);
    (SillyTavern.getContext().powerUserSettings.default_persona as
      string | null) = persona?.avatar || 'user-default.png';

    saveSettingsDebounced();
  }, [personas]);

  const setPersona = useCallback((persona: Persona) => {
    setUserAvatar(persona.avatar, { toastPersonaNameChange: false })
      .then(() => {
        setCurrentPersona(persona);
      })
      .catch((error) => {
        dislog.error('Error setting user avatar:', error);
        toastr.error('Failed to set persona avatar.');
      });
  }, []);

  const loadPersonas = async () => {
    const avatars = await getUserAvatars();
    const loadedPersonas: Persona[] = [];

    for (const avatar of avatars) {
      const name =
        (power_user.personas as Record<string, string>)[avatar] || avatar;
      loadedPersonas.push({
        avatar,
        name,
        avatarURL: getThumbnailUrl('persona', avatar),
      });
    }
    setPersonas(loadedPersonas);
  };

  useEffect(() => {
    let ignore = false;
    const initPersonas = async () => {
      if (ignore) return;
      loadPersonas();
    };
    initPersonas();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    eventSource.on(DISCORDIA_EVENTS.PERSONA_REFRESH, loadPersonas);
    eventSource.on(event_types.PERSONA_CHANGED, handlePersonaUpdate);

    return () => {
      eventSource.removeListener(
        event_types.PERSONA_CHANGED,
        handlePersonaUpdate,
      );
      eventSource.removeListener(
        DISCORDIA_EVENTS.PERSONA_REFRESH,
        loadPersonas,
      );
    };
  }, [handlePersonaUpdate]);

  const contextValue = useMemo(() => {
    return { personas, currentPersona, setPersona };
  }, [currentPersona, personas, setPersona]);

  return <PersonaContext value={contextValue}>{children}</PersonaContext>;
};

export const usePersona = () => {
  const context = use(PersonaContext);
  if (!context) {
    throw new Error('usePersonas must be used within a PersonaProvider');
  }
  return context;
};

export default PersonaProvider;
