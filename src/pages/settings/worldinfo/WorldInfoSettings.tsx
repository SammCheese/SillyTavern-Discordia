import { lazy, useCallback, useState } from 'react';
import WIOverviewSettings from './Settings/WIOverviewSettings';
import WIEntryEditPage from './Settings/WIEntryEditPage';

const SettingsFrame = lazy(() => import('../base/Base'));

const WorldInfoSettings = () => {
  const [currentWorldInfo, setCurrentWorldInfo] = useState<null | string>(null);

  const resetCurrentWorldInfo = useCallback(() => {
    setCurrentWorldInfo(null);
  }, []);

  return (
    <SettingsFrame title="World Info Settings">
      <div className="settings-section overflow-auto">
        {currentWorldInfo === null ? (
          <WIOverviewSettings onSelectWorldInfo={setCurrentWorldInfo} />
        ) : (
          <WIEntryEditPage
            entry={currentWorldInfo}
            onSave={resetCurrentWorldInfo}
            onCancel={resetCurrentWorldInfo}
          />
        )}
      </div>
    </SettingsFrame>
  );
};

export default WorldInfoSettings;
