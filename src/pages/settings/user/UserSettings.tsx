import React from "react";

const SettingsFrame = React.lazy(() => import('../base/Base'));

const { power_user } = await imports('@scripts/powerUser');
const { saveSettingsDebounced } = await imports('@script');

const UserSettings = () => {
  React.useEffect(() => {
    console.log("Power User Settings Loaded:", power_user);
    return () => {
      console.log("Power User Settings Unloaded, saving settings.");
      saveSettingsDebounced();
    };
  }, [power_user]);

  return (
    <SettingsFrame title="User Settings">
      <div className="settings-section">
      </div>
    </SettingsFrame>
  );
};

export default UserSettings;
