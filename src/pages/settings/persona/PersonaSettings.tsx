import { lazy, useEffect, useState } from 'react';
import PersonaEditor from './components/PersonaEditor';
import PersonaSelector from './components/PersonaSelector';
import Divider from '../../../components/common/Divider/Divider';

import { savePersonasData } from './helper';
import { DISCORDIA_EVENTS } from '../../../events/eventTypes';

const SettingsFrame = lazy(() => import('../base/Base'));

const { eventSource } = await imports('@script');

type SillyPersona = Record<string, string>;
type SillyPersonaDescription = Record<
  string,
  {
    depth: number;
    description: string;
    lorebook: string;
    position: number;
    role: number;
    title: string;
  }
>;

const PersonaSettings = () => {
  const [personas, setPersonas] = useState<FullPersona[]>(() => {
    const personaList =
      (SillyTavern.getContext().powerUserSettings.personas as SillyPersona) ??
      [];
    const descriptions =
      (SillyTavern.getContext().powerUserSettings
        .persona_descriptions as SillyPersonaDescription) ?? {};
    return Object.entries(personaList).map(([avatar, name]) => ({
      avatar,
      name,
      ...descriptions[avatar]!,
    }));
  });
  const [selectedPersona, setSelectedPersona] = useState<string>(
    SillyTavern.getContext().powerUserSettings.default_persona || '',
  );
  const [defaultPersona, setDefaultPersona] = useState<string>(
    SillyTavern.getContext().powerUserSettings.default_persona || '',
  );
  const [avatarRefreshNonce, setAvatarRefreshNonce] = useState(() =>
    Date.now(),
  );

  useEffect(() => {
    return () => {
      savePersonasData(personas);
      eventSource.emit(DISCORDIA_EVENTS.PERSONA_REFRESH);
    };
  }, [personas]);

  return (
    <SettingsFrame title="Persona Settings">
      <div className="settings-section">
        <div className="pt-2">
          <PersonaSelector
            personas={personas}
            selectedPersona={selectedPersona}
            setSelectedPersona={setSelectedPersona}
            setPersonas={setPersonas}
            defaultPersona={defaultPersona}
            avatarRefreshNonce={avatarRefreshNonce}
          />
        </div>

        <Divider />

        <div>
          <PersonaEditor
            personas={personas}
            selectedPersona={selectedPersona}
            setPersonas={setPersonas}
            defaultPersona={defaultPersona}
            setDefaultPersona={setDefaultPersona}
            avatarRefreshNonce={avatarRefreshNonce}
            onAvatarUpdated={() => setAvatarRefreshNonce(Date.now())}
          />
        </div>
      </div>
    </SettingsFrame>
  );
};

export default PersonaSettings;
