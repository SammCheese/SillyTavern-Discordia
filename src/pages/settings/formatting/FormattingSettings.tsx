import { lazy, useEffect } from 'react';

const SettingsFrame = lazy(() => import('../base/Base'));

const { saveSettingsDebounced } = await imports('@script');

const FormattingSettings = () => {
  useEffect(() => {
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
