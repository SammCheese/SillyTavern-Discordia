import { lazy } from 'react';
import type { MainAPIValues } from '../connection/hooks/connectionManager';

const SettingsFrame = lazy(() => import('../base/Base'));
const TextCompletionSamplerSettings = lazy(
  () => import('./kinds/TextCompletion'),
);
const ChatCompletionSamplerSettings = lazy(
  () => import('./kinds/ChatCompletion'),
);

const SamplerSetting = () => {
  const type = SillyTavern.getContext().mainApi as MainAPIValues;
  switch (type) {
    case 'textgenerationwebui':
      return <TextCompletionSamplerSettings />;
    case 'openai':
      return <ChatCompletionSamplerSettings />;
    default:
      return null;
  }
};

const SamplerSettings = () => {
  return (
    <SettingsFrame title="Sampler Settings">
      <div className="settings-section">
        {SamplerSetting ? (
          <SamplerSetting />
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
