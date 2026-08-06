import { lazy, useCallback, useMemo, useState } from 'react';
import { saveWorldInfo } from './service/worldinfo';
import GlobalWorldInfoSettings from './Settings/GlobalWorldInfoSettings';

import {
  deleteWorldInfo,
  getWorldInfoSettings,
  world_names,
} from '../../../st/worldInfo';
import WIEntryContainer from './components/WIEntryContainer';
import { usePopup } from '../../../providers/popupProvider';

import Divider from '../../../components/common/Divider/Divider';
import Accordion from '../../../components/common/Accordion/Accordion';

const SettingsFrame = lazy(() => import('../base/Base'));

const WorldInfoSettings = () => {
  const { openPopup, closePopup } = usePopup();
  const worldInfoSettings = useMemo(() => getWorldInfoSettings(), []);
  const availableWorldInfos = world_names;

  const [globalWorldInfo, setGlobalWorldInfo] = useState(
    worldInfoSettings.world_info.globalSelect,
  );
  const [settings, setSettings] = useState(worldInfoSettings);

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

  const handleClose = useCallback(() => {
    saveWorldInfo(settings, globalWorldInfo);
  }, [settings, globalWorldInfo]);

  const activeEntries = useMemo(
    () => availableWorldInfos.filter((info) => globalWorldInfo.includes(info)),
    [availableWorldInfos, globalWorldInfo],
  );

  const inactiveEntries = useMemo(
    () => availableWorldInfos.filter((info) => !globalWorldInfo.includes(info)),
    [availableWorldInfos, globalWorldInfo],
  );

  const handleActiveChange = useCallback(
    (entry: string, isActive: boolean) => {
      let updatedGlobalWorldInfo = [...globalWorldInfo];
      if (isActive) {
        updatedGlobalWorldInfo.push(entry);
      } else {
        updatedGlobalWorldInfo = updatedGlobalWorldInfo.filter(
          (info) => info !== entry,
        );
      }
      setGlobalWorldInfo(updatedGlobalWorldInfo);
      saveWorldInfo(settings, updatedGlobalWorldInfo);
    },
    [globalWorldInfo, settings],
  );

  const handleDelete = useCallback(
    (entry: string) => {
      openPopup(null, {
        title: 'Confirm Deletion',
        description: `Are you sure you want to delete the world info entry "${entry}"? This action cannot be undone.`,
        confirmVariant: 'danger',
        confirmText: 'Delete',
        onConfirm: async () => {
          await deleteWorldInfo(entry);
          closePopup();
        },
        onCancel: () => closePopup(),
      });
    },
    [openPopup, closePopup],
  );

  return (
    <SettingsFrame title="World Info Settings" onClose={handleClose}>
      <div className="settings-section overflow-auto">
        <div className="mb-6">
          <div className="mb-4">
            <Accordion title="Global World Info Settings">
              <GlobalWorldInfoSettings
                settings={settings}
                handleSettingsChange={handleSettingsChange}
              />
            </Accordion>
          </div>

          <Divider />

          <div className="mb-4">
            <WIEntryContainer
              title="Active World Info Entries"
              entries={activeEntries}
              isActiveContainer={true}
              onEdit={() => {}}
              onDelete={handleDelete}
              onChangeActive={handleActiveChange}
            />
          </div>

          <div className="mb-4">
            <WIEntryContainer
              title="Inactive World Info Entries"
              entries={inactiveEntries}
              isActiveContainer={false}
              onEdit={() => {}}
              onDelete={handleDelete}
              onChangeActive={handleActiveChange}
            />
          </div>
        </div>
      </div>
    </SettingsFrame>
  );
};

export default WorldInfoSettings;
