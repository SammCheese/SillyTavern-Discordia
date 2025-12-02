import React from 'react';
import type { ApiBucket } from './ConnectionSettings';
import Select from '../../../components/common/Select/Select';
import Input from '../../../components/common/Input/Input';
import Checkbox from '../../../components/common/Checkbox/Checkbox';
import Button from '../../../components/common/Button/Button';
import Divider from '../../../components/common/Divider/Divider';
import { useConnectionManager } from './hooks/connectionManager';

interface TextGenerationSettingsProps {
  entries: ApiBucket[];
}

const genSet = await imports('@scripts/textGenSettings');
const { saveSettingsDebounced } = await imports('@script');
const { getSecretLabelById } = await imports('@scripts/secrets');
const { getContext } = SillyTavern;

const TextGenerationSettings = ({ entries }: TextGenerationSettingsProps) => {
  const { profiles, selectedProfile, getCurrentApi, setProfiles } =
    useConnectionManager();

  const [settings, setSettings] = React.useState(
    genSet.textgenerationwebui_settings,
  );

  const options = React.useMemo(
    () =>
      entries.map((entry) => ({
        value: entry.name,
        label: entry.name,
      })),
    [entries],
  );

  const setSetting = (
    key: keyof typeof settings,
    value: string | number | boolean,
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    genSet.textgenerationwebui_settings = newSettings;
    saveSettingsDebounced();
  };

  const handleTypeChange = (value: string) => {
    setSetting('type', value);
  };

  const setAutoConnect = (checked: boolean) => {
    getContext().extensionSettings.autoConnect = checked;
    saveSettingsDebounced();
  };

  const getAutoConnect = () => {
    return getContext().extensionSettings.autoConnect;
  };

  const handleApiUrlChange = (value: string) => {
    if (!selectedProfile) return;
    const updatedProfiles = profiles.map((p) =>
      p.id === selectedProfile.id ? { ...p, 'api-url': value } : p,
    );
    setProfiles(updatedProfiles);
  };

  const handleApiKeyChange = (value: string) => {
    if (!selectedProfile) return;
    const updatedProfiles = profiles.map((p) =>
      p.id === selectedProfile.id ? { ...p, 'secret-id': value } : p,
    );
    setProfiles(updatedProfiles);
  };

  return (
    <div>
      <h3>API Type</h3>
      <Select
        options={options}
        onChange={handleTypeChange}
        value={settings.type}
      />

      <Divider />
      <Input
        label="API KEY"
        placeholder={getSecretLabelById(
          selectedProfile?.['secret-id'] ?? 'Enter your API Key',
        )}
        value={''}
        onChange={handleApiKeyChange}
        type="password"
      />

      <Input
        style={{ marginTop: '12px' }}
        label="API URL"
        placeholder="Enter your API URL"
        value={selectedProfile?.['api-url'] ?? ''}
        onChange={handleApiUrlChange}
        type="text"
      />

      <div className="mt-4">
        <Checkbox
          label="Derive Contextsize from Backend"
          checked={getAutoConnect()}
          onChange={setAutoConnect}
        />
      </div>

      <div className="flex items-center space-x-4 my-4">
        <Button
          label="Connect"
          onClick={() => genSet.getTextGenServer(getCurrentApi())}
        />
        <Checkbox
          label="Auto Connect to last Server"
          checked={getAutoConnect()}
          onChange={setAutoConnect}
        />
      </div>
    </div>
  );
};

export default TextGenerationSettings;
