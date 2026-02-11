import { lazy, useEffect } from 'react';

const SettingsFrame = lazy(() => import('../base/Base'));

const { power_user } = await imports('@scripts/powerUser');
const { saveSettingsDebounced } = await imports('@script');

const UserSettings = () => {
  useEffect(() => {
    console.log('Power User Settings Loaded:', power_user);
    return () => {
      console.log('Power User Settings Unloaded, saving settings.');
      saveSettingsDebounced();
    };
  }, []);

  return (
    <SettingsFrame title="User Settings">
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

export default UserSettings;
