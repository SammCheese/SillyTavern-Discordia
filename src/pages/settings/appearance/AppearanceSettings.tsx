import { lazy, useEffect } from 'react';

const SettingsFrame = lazy(() => import('../base/Base'));

const { saveSettingsDebounced } = await imports('@script');

const AppearanceSettings = () => {
  useEffect(() => {
    return () => {
      saveSettingsDebounced();
    };
  }, []);

  return (
    <SettingsFrame title="Appearance Settings">
      <div className="settings-section"></div>
    </SettingsFrame>
  );
};

export default AppearanceSettings;
