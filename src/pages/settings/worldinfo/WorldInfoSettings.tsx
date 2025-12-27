import { lazy, useCallback, useEffect, useState } from 'react';
import { getAllWorldInfos } from './service/worldinfo';
import StackPusher from '../../../components/common/StackPusher/StackPusher';
import GlobalWorldInfoSettings from './Settings/GlobalWorldInfoSettings';

const SettingsFrame = lazy(() => import('../base/Base'));
const Accordion = lazy(
  () => import('../../../components/common/Accordion/Accordion'),
);
const Divider = lazy(
  () => import('../../../components/common/Divider/Divider'),
);

const { getWorldInfoSettings, selected_world_info, world_names } =
  await imports('@scripts/worldInfo');

const WorldInfoSettings = () => {
  const [availableWorldInfos, setAvailableWorldInfos] = useState(world_names);
  const [selectedWorldInfo, setSelectedWorldInfo] =
    useState(selected_world_info);
  const [settings, setSettings] = useState(getWorldInfoSettings());

  useEffect(() => {
    const updateEntries = async () => {
      setAvailableWorldInfos(await getAllWorldInfos());
    };

    updateEntries();
  }, []);

  const handleSettingsChange = (
    key: string,
    value: string | boolean | number | undefined,
  ) => {
    const updatedSettings = {
      ...settings,
      [key]: value,
    };
    setSettings(updatedSettings);
  };

  const handleStackChange = useCallback((active: string[]) => {
    setSelectedWorldInfo(active);
    setSettings((prevSettings) => ({
      ...prevSettings,
      world_info: { globalSelect: active },
    }));
  }, []);

  const handleClose = useCallback(() => {
    //saveSettingsDebounced(settings, selectedWorldInfo);
  }, []);

  return (
    <SettingsFrame title="World Info Settings" onClose={handleClose}>
      <div className="settings-section overflow-auto">
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Manage Global Entries</h2>
            <p className="text-sm text-gray-400">
              Select which world info entries are globally active.
            </p>
          </div>

          <div>
            <StackPusher
              inactiveEntries={availableWorldInfos.filter(
                (info) => !selectedWorldInfo.includes(info),
              )}
              activeEntries={availableWorldInfos.filter((info) =>
                selectedWorldInfo.includes(info),
              )}
              onStackChange={handleStackChange}
              activeLabel="Global Entries"
              inactiveLabel="Inactive Entries"
            />
          </div>
        </div>

        <Divider />

        <Accordion title="Global World Info Settings">
          <GlobalWorldInfoSettings
            settings={settings}
            handleSettingsChange={handleSettingsChange}
          />
        </Accordion>

        <Divider />

        <div></div>
      </div>
    </SettingsFrame>
  );
};

export default WorldInfoSettings;
