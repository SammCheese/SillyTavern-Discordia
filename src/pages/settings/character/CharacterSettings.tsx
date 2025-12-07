import { lazy, useEffect } from 'react';

const SettingsFrame = lazy(() => import('../base/Base'));

const { saveSettingsDebounced } = await imports('@script');

const CharacterSettings = () => {
  useEffect(() => {
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
