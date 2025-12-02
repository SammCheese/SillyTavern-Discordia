import React from 'react';

const SettingsFrame = React.lazy(() => import('../base/Base'));

const { saveSettingsDebounced } = await imports('@script');

const FormattingSettings = () => {
  React.useEffect(() => {
    return () => {
      saveSettingsDebounced();
    };
  }, []);

  return (
    <SettingsFrame title="Formatting Settings">
      <div className="settings-section"></div>
    </SettingsFrame>
  );
};

export default FormattingSettings;
