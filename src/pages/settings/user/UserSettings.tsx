import React from "react";
import SettingsFrame from "../base/Base";

const { power_user } = await imports('@scripts/powerUser');

const UserSettings = () => {

  return (
    <SettingsFrame title="User Settings">
      <div className="settings-section">
        <h3>Power User Settings</h3>
        <label>
          <input
            type="range"
            value={power_user.chat_width}
            onChange={(e) => {
              power_user.chat_width = e.target.valueAsNumber;
            }}
          />
          Enable Power User Features
        </label>
      </div>
    </SettingsFrame>
  );
};

export default UserSettings;
