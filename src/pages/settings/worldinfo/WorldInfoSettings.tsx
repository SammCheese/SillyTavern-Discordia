import { lazy, useEffect, useState } from 'react';
import { getWorldInfos } from './service/worldinfo';

const SettingsFrame = lazy(() => import('../base/Base'));
const Accordion = lazy(
  () => import('../../../components/common/Accordion/Accordion'),
);
const Divider = lazy(
  () => import('../../../components/common/Divider/Divider'),
);
const Checkbox = lazy(
  () => import('../../../components/common/Checkbox/Checkbox'),
);

const { saveSettingsDebounced } = await imports('@script');
const { setWorldInfoSettings, getWorldInfoSettings, selected_world_info } =
  await imports('@scripts/worldInfo');

const WorldInfoSettings = () => {
  const [settings, setSettings] = useState(getWorldInfoSettings);
  const [entries, setEntries] = useState(selected_world_info);

  useEffect(() => {
    const updateEntries = async () => {
      const fetchedEntries = await getWorldInfos();
      console.log('Fetched Entries:', fetchedEntries);
      setEntries(fetchedEntries);
    };

    updateEntries();

    console.log('World Info Settings loaded:', settings);

    return () => {
      saveSettingsDebounced();
    };
  }, [settings]);

  const handleSettingsChange = (
    key: string,
    value: string | boolean | undefined,
  ) => {
    setSettings((prevSettings) => {
      const newSettings = { ...prevSettings, [key]: value };
      setWorldInfoSettings(key, value);
      return newSettings;
    });
  };

  return (
    <SettingsFrame title="World Info Settings">
      <div
        className="settings-section overflow-auto"
        style={{ maxHeight: '70dvh' }}
      >
        <div>
          <div>Active Global World Info (WIP)</div>
          <ul>
            {entries.map((entry, index) => (
              <li key={index} className="mb-2">
                {entry.world}
              </li>
            ))}
          </ul>
        </div>

        <Divider />

        <Accordion title="Global World Info Settings">
          <div className="mb-4">
            <label className="block mb-2 font-medium">Scan Depth</label>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Context %</label>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Budget Cap</label>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Min Activations</label>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Max Depth</label>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Max Recursion Steps
            </label>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Insertion Strategy</label>
          </div>

          <div className="mb-4">
            <Checkbox
              label="Include Names"
              checked={settings.world_info_include_names}
              onChange={(checked) => {
                handleSettingsChange('world_info_include_names', checked);
              }}
            />
          </div>
          <div className="mb-4">
            <Checkbox
              label="Recursive Scan"
              checked={settings.world_info_recursive}
              onChange={(checked) => {
                handleSettingsChange('world_info_recursive', checked);
              }}
            />
          </div>
          <div className="mb-4">
            <Checkbox
              label="Case-sensitive"
              checked={settings.world_info_case_sensitive}
              onChange={(checked) => {
                handleSettingsChange('world_info_case_sensitive', checked);
              }}
            />
          </div>
          <div className="mb-4">
            <Checkbox
              label="Match Whole Words"
              checked={settings.world_info_match_whole_words}
              onChange={(checked) => {
                handleSettingsChange('world_info_match_whole_words', checked);
              }}
            />
          </div>
          <div className="mb-4">
            <Checkbox
              label="Use Group Scoring"
              checked={settings.world_info_use_group_scoring}
              onChange={(checked) => {
                handleSettingsChange('world_info_use_group_scoring', checked);
              }}
            />
          </div>
          <div className="mb-4">
            <Checkbox
              label="Alert on Overflow"
              checked={settings.world_info_overflow_alert}
              onChange={(checked) => {
                handleSettingsChange('world_info_overflow_alert', checked);
              }}
            />
          </div>
        </Accordion>

        <Divider />

        <div></div>
      </div>
    </SettingsFrame>
  );
};

export default WorldInfoSettings;
