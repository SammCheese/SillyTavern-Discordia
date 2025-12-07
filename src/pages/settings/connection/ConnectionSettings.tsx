import { lazy, useCallback, useEffect, useMemo, useState } from 'react';
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

  const [currentApi, setCurrentApiState] = useState<MainAPIValues>(() =>
    getCurrentApi(),
  );

  useEffect(() => {
    setCurrentApiState(getCurrentApi());
  }, [selectedProfileId]);

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
  }, [CONNECT_API_MAP]);

  const renderConnectionInfo = useMemo(() => {
    switch (currentApi) {
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
            entries={apiBuckets[currentApi]}
          />
        );
      case 'koboldhorde':
        return <div>Kobold Horde API Connection Settings</div>;
      default:
        return (
          <div>No connection settings available for the selected API.</div>
        );
    }
  }, [currentApi, selectedProfileId, apiBuckets]);

  const makeProfileOptions = useCallback(() => {
    return profiles.map((profile) => ({
      value: profile.id ?? '',
      label: profile.name ?? '',
    }));
  }, [profiles]);

  const handleProfileChange = (profile_id: string) => {
    setSelectedProfile(profile_id);
    const aiMode = profiles.find((p) => p.id === profile_id)?.mode;
    const api = AIOptions.find((option) => option.short === aiMode)
      ?.value as MainAPIValues;
    if (api) {
      setCurrentApi(api);
      setCurrentApiState(api);
    }
  };

  const handleApiChange = (value: string) => {
    const apiValue = value as MainAPIValues;
    setCurrentApi(apiValue);
    setCurrentApiState(apiValue);
  };

  return (
    <SettingsFrame title="Connection Settings">
      <div className="p-4 space-y-4 overflow-auto flex flex-col">
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
          value={currentApi}
          onChange={handleApiChange}
        />

        <Divider />
        <div className="settings-section">{renderConnectionInfo}</div>
      </div>
    </SettingsFrame>
  );
};

export default ConnectionSettings;
