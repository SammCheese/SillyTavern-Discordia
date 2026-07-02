import { memo, useState, useMemo, useCallback } from 'react';
import type { ApiBucket } from '../../ConnectionSettings';
import Select from '../../../../../components/common/Select/Select';
import Input from '../../../../../components/common/Input/Input';
import Checkbox from '../../../../../components/common/Checkbox/Checkbox';
import Button from '../../../../../components/common/Button/Button';
import Divider from '../../../../../components/common/Divider/Divider';
import { useConnectionManager } from '../../hooks/connectionManager';
import { getTextGenStatus } from '../../services/textgenConn';

import {
  saveSettingsDebounced,
  setOnlineStatus,
} from '../../../../../st/script';
import { getSecretLabelById } from '../../../../../st/secrets';
interface TextGenerationSettingsProps {
  entries: ApiBucket[];
}

import { textGenSettingsModule as genSet } from '../../../../../st/textGenSettings';
const { getContext } = SillyTavern;

const _ = SillyTavern.libs.lodash;

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
  const handleTypeChange = useCallback(
    (value: string | number) => {
      updateCurrentProfile({ api: value as string });
      updateGlobalSetting('type', value);
    },
    [updateCurrentProfile, updateGlobalSetting],
  );

  const handleApiUrlChange = useCallback(
    (value: string) => {
      _.debounce(() => {
        setConnectionStatus(undefined);
        const apitype = selectedProfile?.api || textSettings.type;
        updateGlobalSetting('server_urls', {
          ...textSettings.server_urls,
          [apitype]: value,
        });
        updateCurrentProfile({ 'api-url': value });
      }, 500)();
    },
    [
      selectedProfile?.api,
      textSettings.server_urls,
      textSettings.type,
      updateCurrentProfile,
      updateGlobalSetting,
    ],
  );

  const handleApiKeyChange = useCallback((value: string) => {
    setApiKeyInput(value);
    //updateCurrentProfile({ 'secret-id': value });
  }, []);

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

      <div className="mt-4 flex flex-col gap-2">
        <Checkbox
          label="Derive Contextsize from Backend"
          checked={deriveContextState}
          onChange={handleDeriveContextClick}
        />
        <Checkbox
          label="Auto Connect to last Server"
          checked={autoConnectState}
          onChange={handleAutoConnectClick}
        />
      </div>

      <div className="flex items-center space-x-4 my-4">
        <Button label="Connect" onClick={handleConnectClick} />
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
    </div>
  );
};

export default memo(TextGenerationSettings);
