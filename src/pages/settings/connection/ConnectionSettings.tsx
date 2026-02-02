import { lazy, useCallback, useMemo, useState } from 'react';
import Select from '../../../components/common/Select/Select';
import Divider from '../../../components/common/Divider/Divider';
import {
  useConnectionManager,
  type MainAPIValues,
} from './services/connectionManager';

const SettingsFrame = lazy(() => import('../base/Base'));
const TextGenerationSettings = lazy(
  () => import('./apis/TextCompletion/TextCompletion'),
);

const script = await imports('@script');
const { CONNECT_API_MAP } = script;

export type ApiBucket = {
  name: string;
  selected: string;
  button?: string | null;
  type?: string | null;
  source?: string | null;
};

type ApiBuckets = Record<MainAPIValues, ApiBucket[]>;

const AIOptions = [
  { value: 'textgenerationwebui', label: 'Text Completion', short: 'tc' },
  { value: 'openai', label: 'Chat Completion', short: 'cc' },
  { value: 'novel', label: 'NovelAI', short: 'na' },
  { value: 'koboldhorde', label: 'AI Horde', short: 'ah' },
  { value: 'kobold', label: 'KoboldAI Classic', short: 'kc' },
];

const ConnectionSettings = () => {
  const {
    profiles,
    selectedProfileId,
    getCurrentApi,
    setCurrentApi,
    setSelectedProfile,
  } = useConnectionManager();

  const [localApiOverride, setLocalApiOverride] =
    useState<MainAPIValues | null>(null);

  const currentApiState = localApiOverride ?? getCurrentApi();

  const apiBuckets: ApiBuckets = useMemo(() => {
    const buckets: Partial<ApiBuckets> = {};
    Object.entries(CONNECT_API_MAP).forEach(([name, data]) => {
      const type = data.selected as MainAPIValues;

      if (!buckets[type]) {
        buckets[type] = [];
      }

      buckets[type]!.push({ name, ...data });
    });
    return buckets as ApiBuckets;
  }, []);

  const renderConnectionInfo = useMemo(() => {
    switch (currentApiState) {
      case 'kobold':
        return <div>Kobold API Connection Settings</div>;
      case 'openai':
        return <div>OpenAI API Connection Settings</div>;
      case 'novel':
        return <div>Novel API Connection Settings</div>;
      case 'textgenerationwebui':
        return (
          <TextGenerationSettings
            key={selectedProfileId}
            entries={apiBuckets[currentApiState]}
          />
        );
      case 'koboldhorde':
        return <div>Kobold Horde API Connection Settings</div>;
      default:
        return (
          <div>No connection settings available for the selected API.</div>
        );
    }
  }, [currentApiState, selectedProfileId, apiBuckets]);

  const makeProfileOptions = useCallback(() => {
    return profiles.map((profile) => ({
      value: profile.id ?? '',
      label: profile.name ?? '',
    }));
  }, [profiles]);

  const handleProfileChange = (profile_id: string | number) => {
    setSelectedProfile(profile_id as string);
    const aiMode = profiles.find((p) => p.id === profile_id)?.mode;
    const api = AIOptions.find((option) => option.short === aiMode)
      ?.value as MainAPIValues;
    if (api) {
      setCurrentApi(api);
      setLocalApiOverride(api);
    }
  };

  const handleApiChange = (value: string | number) => {
    const apiValue = value as MainAPIValues;
    setCurrentApi(apiValue);
    setLocalApiOverride(apiValue);
  };

  return (
    <SettingsFrame title="Connection Settings">
      <div
        style={{ maxHeight: '80vh' }}
        className="p-4 space-y-4 overflow-auto flex flex-col"
      >
        <h2>Profile</h2>

        <Select
          options={makeProfileOptions()}
          value={selectedProfileId}
          onChange={handleProfileChange}
        />

        <Divider />

        <h2>API</h2>
        <Select
          options={AIOptions}
          value={currentApiState}
          onChange={handleApiChange}
        />

        <Divider />
        <div className="settings-section">{renderConnectionInfo}</div>
      </div>
    </SettingsFrame>
  );
};

export default ConnectionSettings;
