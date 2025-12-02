import React from 'react';

const SettingsFrame = React.lazy(() => import('../base/Base'));

const { saveSettingsDebounced } = await imports('@script');

const SamplerSettings = () => {
  React.useEffect(() => {
    return () => {
      saveSettingsDebounced();
    };
  }, []);

  return (
    <SettingsFrame title="Sampler Settings">
      <div className="settings-section"></div>
    </SettingsFrame>
  );
};

export default SamplerSettings;
