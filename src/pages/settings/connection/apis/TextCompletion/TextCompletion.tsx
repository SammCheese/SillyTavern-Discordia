import { memo, useState, useMemo, useCallback } from 'react';
import type { ApiBucket } from '../../ConnectionSettings';
import Select from '../../../../../components/common/Select/Select';
import Input from '../../../../../components/common/Input/Input';
import Checkbox from '../../../../../components/common/Checkbox/Checkbox';
import Button from '../../../../../components/common/Button/Button';
import Divider from '../../../../../components/common/Divider/Divider';
import { useConnectionManager } from '../../services/connectionManager';
import { getTextGenStatus } from '../../services/textgenConn';

interface TextGenerationSettingsProps {
  entries: ApiBucket[];
}

const genSet = await imports('@scripts/textGenSettings');
const { saveSettingsDebounced, setOnlineStatus } = await imports('@script');
const { getSecretLabelById } = await imports('@scripts/secrets');
const { getContext } = SillyTavern;

const TextGenerationSettings = ({ entries }: TextGenerationSettingsProps) => {
  const { selectedProfile, updateCurrentProfile } = useConnectionManager();
  const [textSettings, setTextSettings] = useState(
    genSet.textgenerationwebui_settings,
  );
  const [connectionStatus, setConnectionStatus] = useState<
    string | false | undefined
  >(undefined);

  const options = useMemo(
    () =>
      entries.map((entry) => ({
        value: entry.name,
        label: entry.name,
      })),
    [entries],
  );

  const updateGlobalSetting = useCallback(
    (key: keyof typeof textSettings, value: unknown) => {
      setTextSettings((prev: typeof textSettings) => ({
        ...prev,
        [key]: value,
      }));
      getContext().textCompletionSettings[key] = value as never;
      saveSettingsDebounced();
    },
    [],
  );

  const [autoConnectState, setAutoConnectState] = useState(
    () => getContext().extensionSettings.autoConnect,
  );
  const [deriveContextState, setDeriveContextState] = useState(
    () => getContext().powerUserSettings.context_size_derived,
  );
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Handlers
  const handleTypeChange = (value: string | number) => {
    updateCurrentProfile({ api: value as string });
    updateGlobalSetting('type', value);
  };

  const handleApiUrlChange = (value: string) => {
    setConnectionStatus(undefined);
    const apitype = selectedProfile?.api || textSettings.type;
    updateGlobalSetting('server_urls', {
      ...textSettings.server_urls,
      [apitype]: value,
    });
    updateCurrentProfile({ 'api-url': value });
  };

  const handleApiKeyChange = (value: string) => {
    setApiKeyInput(value);
    //updateCurrentProfile({ 'secret-id': value });
  };

  const handleConnectClick = async () => {
    // Reset status on new connect attempt
    setConnectionStatus(undefined);

    const url = selectedProfile?.['api-url'];
    if (!url) return;

    const status = await getTextGenStatus(url);

    setConnectionStatus(status);
    setOnlineStatus(status ? status : 'no_connection');

    if (!status) return;

    // Api returned a model name, store it in profile
    updateCurrentProfile({ model: status });
  };

  const handleAutoConnectClick = (value: boolean) => {
    setAutoConnectState(value);
    getContext().extensionSettings.autoConnect = value;
    saveSettingsDebounced();
  };

  const handleDeriveContextClick = (value: boolean) => {
    setDeriveContextState(value);
    getContext().powerUserSettings.context_size_derived = value;
    saveSettingsDebounced();
  };

  return (
    <div>
      <h3>API Type</h3>
      <Select
        options={options}
        onChange={handleTypeChange}
        value={textSettings.type}
      />

      <Divider />
      <Input
        label="API KEY"
        placeholder={getSecretLabelById(
          selectedProfile?.['secret-id'] ?? 'Enter your API Key',
        )}
        value={apiKeyInput}
        onChange={handleApiKeyChange}
        type="password"
        disabled={true}
      />

      <Input
        style={{ marginTop: '12px' }}
        label="API URL"
        placeholder="Enter your API URL"
        value={selectedProfile?.['api-url']}
        onChange={handleApiUrlChange}
        type="text"
      />

      <div className="mt-4">
        <Checkbox
          label="Derive Contextsize from Backend"
          checked={deriveContextState}
          onChange={handleDeriveContextClick}
        />
      </div>

      <div className="flex items-center space-x-4 my-4">
        <Button label="Connect" onClick={handleConnectClick} />
        <Checkbox
          label="Auto Connect to last Server"
          checked={autoConnectState}
          onChange={handleAutoConnectClick}
        />
      </div>
      {connectionStatus !== undefined && (
        <div
          className={`text-sm font-medium ${connectionStatus ? 'text-green-400' : 'text-red-400'}`}
        >
          Server is {connectionStatus ? 'Online!' : 'Offline'}
          {connectionStatus && (
            <div className="text-gray-400 text-xs font-normal mt-1">
              Model: {connectionStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(TextGenerationSettings);
