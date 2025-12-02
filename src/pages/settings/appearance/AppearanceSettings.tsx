import React from 'react';

const SettingsFrame = React.lazy(() => import('../base/Base'));

const { saveSettingsDebounced } = await imports('@script');

const AppearanceSettings = () => {
  React.useEffect(() => {
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
