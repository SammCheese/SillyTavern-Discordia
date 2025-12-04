import React from 'react';

const SettingsFrame = React.lazy(() => import('../base/Base'));

const { saveSettingsDebounced } = await imports('@script');

const PersonaSettings = () => {
  React.useEffect(() => {
    return () => {
      saveSettingsDebounced();
    };
  }, []);

  return (
    <SettingsFrame title="Persona Settings">
      <div className="settings-section"></div>
    </SettingsFrame>
  );
};

export default PersonaSettings;
