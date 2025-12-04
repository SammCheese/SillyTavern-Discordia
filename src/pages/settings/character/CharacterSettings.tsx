import React from 'react';

const SettingsFrame = React.lazy(() => import('../base/Base'));

const { saveSettingsDebounced } = await imports('@script');

const CharacterSettings = () => {
  React.useEffect(() => {
    return () => {
      saveSettingsDebounced();
    };
  }, []);

  return (
    <SettingsFrame title="Character Settings">
      <div className="settings-section"></div>
    </SettingsFrame>
  );
};

export default CharacterSettings;
