import { memo, useState, useMemo, useCallback } from 'react';
import Input from '../../../../../components/common/Input/Input';
import Checkbox from '../../../../../components/common/Checkbox/Checkbox';
import Button from '../../../../../components/common/Button/Button';
import Divider from '../../../../../components/common/Divider/Divider';
import { useConnectionManager } from '../../hooks/connectionManager';
import Select from '../../../../../components/common/Select/Select';
import { getChatCompletionStatus } from '../../services/chatCompletion';

import {
  saveSettingsDebounced,
  setOnlineStatus,
} from '../../../../../st/script';
import { getSecretLabelById } from '../../../../../st/secrets';
import {
  chat_completion_sources,
  oai_settings,
  custom_prompt_post_processing_types,
} from '../../../../../st/openai';
const { getContext } = SillyTavern;

const ChatCompletionSettings = () => {
  const { selectedProfile, updateCurrentProfile } = useConnectionManager();
  const [openAISettings, setOpenAISettings] = useState(
    () => getContext().chatCompletionSettings || oai_settings,
  );
  const [connectionStatus, setConnectionStatus] = useState<
    string | false | undefined
  >(undefined);
  const [isConnecting, setIsConnecting] = useState(false);

  const options = useMemo(
    () =>
      Object.entries(chat_completion_sources).map(([, entry]) => ({
        value: entry,
        label: entry,
      })),
    [],
  );

  const postProcessingOptions = useMemo(
    () => [
      { value: 'None', label: 'None' },
      {
        value: custom_prompt_post_processing_types.MERGE_TOOLS,
        label: 'Merge consecutive roles (with tools)',
      },
      {
        value: custom_prompt_post_processing_types.SEMI_TOOLS,
        label: 'Semi-strict (alternating roles; with tools)',
      },
      {
        value: custom_prompt_post_processing_types.STRICT_TOOLS,
        label: 'Strict (user first, alternating roles; with tools)',
      },
      {
        value: custom_prompt_post_processing_types.MERGE,
        label: 'Merge consecutive roles (no tools)',
      },
      {
        value: custom_prompt_post_processing_types.SEMI,
        label: 'Semi-strict (alternating roles; no tools)',
      },
      {
        value: custom_prompt_post_processing_types.STRICT,
        label: 'Strict (user first, alternating roles; no tools)',
      },
      {
        value: custom_prompt_post_processing_types.SINGLE,
        label: 'Single user message (no tools)',
      },
    ],
    [],
  );

  const source = (selectedProfile?.api ||
    openAISettings.chat_completion_source) as string;
  const isCustomSource = source === chat_completion_sources.CUSTOM;
  const isAzureSource = source === chat_completion_sources.AZURE_OPENAI;

  const statusTone =
    connectionStatus === undefined
      ? 'text-gray-300'
      : connectionStatus === false
        ? 'text-red-400'
        : connectionStatus.includes('Invalid')
          ? 'text-yellow-300'
          : connectionStatus.includes('bypassed') ||
              connectionStatus.includes('Key saved')
            ? 'text-blue-300'
            : 'text-green-400';

  const statusTitle =
    connectionStatus === undefined
      ? 'Unknown'
      : connectionStatus === false
        ? 'Offline'
        : 'Online';

  const updateGlobalSetting = useCallback(
    (key: keyof typeof oai_settings, value: unknown) => {
      setOpenAISettings((prev: typeof oai_settings) => ({
        ...prev,
        [key]: value,
      }));
      getContext().chatCompletionSettings[key] = value as never;
      saveSettingsDebounced();
    },
    [],
  );

  const [autoConnectState, setAutoConnectState] = useState(
    () => getContext().extensionSettings.autoConnect,
  );
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [bypassStatusCheck, setBypassStatusCheck] = useState(
    () => getContext().chatCompletionSettings.bypass_status_check,
  );

  const handleTypeChange = (value: string | number) => {
    updateCurrentProfile({ api: value as string });
    updateGlobalSetting('chat_completion_source', value);
    setConnectionStatus(undefined);
  };

  const handleCustomPromptPostProcessingChange = (value: string | number) => {
    updateCurrentProfile({ 'prompt-post-processing': value as string });
    updateGlobalSetting('custom_prompt_post_processing', value);
  };

  const handleApiUrlChange = (value: string) => {
    setConnectionStatus(undefined);
    if (isAzureSource) {
      updateGlobalSetting('azure_base_url', value);
    } else {
      updateGlobalSetting('custom_url', value);
    }
    updateCurrentProfile({ 'api-url': value });
  };

  const handleAzureDeploymentChange = (value: string) => {
    setConnectionStatus(undefined);
    updateGlobalSetting('azure_deployment_name', value);
  };

  const handleAzureVersionChange = (value: string) => {
    setConnectionStatus(undefined);
    updateGlobalSetting('azure_api_version', value);
  };

  const handleApiKeyChange = (value: string) => {
    setApiKeyInput(value);
    //updateCurrentProfile({ 'secret-id': value });
  };

  const handleConnectClick = async () => {
    setConnectionStatus(undefined);
    setIsConnecting(true);

    const url = isAzureSource
      ? openAISettings.azure_base_url
      : selectedProfile?.['api-url'] || openAISettings.custom_url;

    try {
      const status = await getChatCompletionStatus(url);

      setConnectionStatus(status);
      setOnlineStatus(status ? status : 'no_connection');

      if (
        typeof status === 'string' &&
        ![
          'Valid',
          'Status check bypassed',
          'Key saved; press "Test Message" to verify.',
          'Invalid endpoint URL. Requests may fail.',
          'Invalid Azure endpoint URL. Requests may fail.',
        ].includes(status)
      ) {
        updateCurrentProfile({ model: status });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAutoConnectClick = (value: boolean) => {
    setAutoConnectState(value);
    getContext().extensionSettings.autoConnect = value;
    saveSettingsDebounced();
  };

  const handleBypassStatusCheck = (value: boolean) => {
    setBypassStatusCheck(value);
    updateGlobalSetting('bypass_status_check', value);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3>Chat Completion Source</h3>
      </div>

      <Select options={options} onChange={handleTypeChange} value={source} />

      {(isCustomSource || isAzureSource) && (
        <>
          <Input
            style={{ marginTop: '4px' }}
            label={isAzureSource ? 'Azure Base URL' : 'API URL'}
            placeholder={
              isAzureSource
                ? 'https://your-resource.openai.azure.com/'
                : 'Enter your API URL'
            }
            value={
              isAzureSource
                ? openAISettings.azure_base_url
                : selectedProfile?.['api-url'] || openAISettings.custom_url
            }
            onChange={handleApiUrlChange}
            type="text"
          />

          {isAzureSource && (
            <>
              <Input
                label="Azure Deployment Name"
                placeholder="gpt-4o-mini"
                value={openAISettings.azure_deployment_name}
                onChange={handleAzureDeploymentChange}
                type="text"
              />
              <Input
                label="Azure API Version"
                placeholder="2024-10-21"
                value={openAISettings.azure_api_version}
                onChange={handleAzureVersionChange}
                type="text"
              />
            </>
          )}
        </>
      )}

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

      <div className="flex flex-col gap-2">
        <h3>Prompt Post-Processing</h3>
        <Select
          options={postProcessingOptions}
          onChange={handleCustomPromptPostProcessingChange}
          value={openAISettings.custom_prompt_post_processing || 'None'}
        />
      </div>

      <div className="flex flex-col gap-2">
        {source === chat_completion_sources.OPENAI && (
          <Checkbox
            label="Bypass status check (OpenAI only)"
            checked={bypassStatusCheck}
            onChange={handleBypassStatusCheck}
          />
        )}
        <Checkbox
          label="Auto Connect to last Server"
          checked={autoConnectState}
          onChange={handleAutoConnectClick}
        />
      </div>

      <div className="flex flex-row items-center gap-3 my-2">
        <Button
          label={isConnecting ? 'Connecting...' : 'Connect'}
          onClick={handleConnectClick}
          disabled={isConnecting}
        />

        {connectionStatus !== undefined && (
          <div
            className={`text-sm font-medium rounded-md p-2 bg-black/20 ${statusTone}`}
          >
            <p className="font-semibold">Connection: {statusTitle}</p>
            <p className="text-xs font-normal mt-1 break-all">
              {connectionStatus === false
                ? 'Unable to connect to provider.'
                : connectionStatus}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ChatCompletionSettings);
