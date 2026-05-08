import { lazy, useMemo } from 'react';
import type { MainAPIValues } from '../connection/hooks/connectionManager';

const SettingsFrame = lazy(() => import('../base/Base'));
const TextCompletionSamplerSettings = lazy(
  () => import('./kinds/TextCompletion'),
);
const ChatCompletionSamplerSettings = lazy(
  () => import('./kinds/ChatCompletion'),
);

const SamplerSettings = () => {
  const SamplerSettings = useMemo(() => {
    const type = SillyTavern.getContext().mainApi as MainAPIValues;
    switch (type) {
      case 'textgenerationwebui':
        return TextCompletionSamplerSettings;
      case 'openai':
        return ChatCompletionSamplerSettings;
      default:
        return null;
    }
  }, []);

  return (
    <SettingsFrame title="Sampler Settings">
      <div className="settings-section">
        {SamplerSettings ? (
          <SamplerSettings />
        ) : (
          <div className="text-muted">
            No sampler settings available for the current API...
          </div>
        )}
      </div>
    </SettingsFrame>
  );
};

export default SamplerSettings;
