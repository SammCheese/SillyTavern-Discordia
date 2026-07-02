import { lazy, useEffect } from 'react';

import { saveSettingsDebounced } from '../../../st/script';
const SettingsFrame = lazy(() => import('../base/Base'));

const CharacterSettings = () => {
  useEffect(() => {
    return () => {
      saveSettingsDebounced();
    };
  }, []);

  return (
    <SettingsFrame title="Character Settings">
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

export default CharacterSettings;
