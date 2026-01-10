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
      <div className="settings-section">
        <div className="text-2xlxl text-gray-500 text-center mt-20">
          <span>Nothing to see here yet!</span>
          <br />
          <span>Check back later.</span>
        </div>
      </div>
    </SettingsFrame>
  );
};

export default FormattingSettings;
