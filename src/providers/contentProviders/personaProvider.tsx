import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export const PersonaContext = createContext<{
  personas: Persona[];
  currentPersona?: Persona | null;
  setPersona: (persona: Persona) => void;
}>({
  personas: [],
  currentPersona: null,
  setPersona: () => {},
});

const { eventSource, event_types, getThumbnailUrl } = await imports('@script');
const { getUserAvatars, setUserAvatar } = await imports('@scripts/personas');
const { power_user } = await imports('@scripts/powerUser');

interface PersonaProviderProps {
  children: ReactNode;
}

export const PersonaProvider = ({ children }: PersonaProviderProps) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(() => {
    return {
      name: SillyTavern.getContext().name1 || 'Unknown',
      avatar: 'user-default.png',
      avatarURL: getThumbnailUrl('persona', 'user-default.png'),
    } as Persona;
  });

  const handlePersonaUpdate = useCallback(() => {
    const persona = SillyTavern.getContext().name1;
    setCurrentPersona(personas.find((p) => p.name === persona) || null);
  }, [personas]);

  const setPersona = useCallback((persona: Persona) => {
    setUserAvatar(persona.avatar, { toastPersonaNameChange: true })
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
      const name = power_user.personas[avatar] || avatar;
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
    eventSource.on(event_types.PERSONA_CHANGED, handlePersonaUpdate);

    return () => {
      eventSource.removeListener(
        event_types.PERSONA_CHANGED,
        handlePersonaUpdate,
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
