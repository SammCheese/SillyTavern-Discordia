import { lazy } from 'react';

const SettingsFrame = lazy(() => import('../base/Base'));
const TextCompletionSamplerSettings = lazy(
  () => import('./kinds/TextCompletion'),
);

const SamplerSettings = () => {
  return (
    <SettingsFrame title="Sampler Settings">
      <div className="settings-section">
        <TextCompletionSamplerSettings />
      </div>
    </SettingsFrame>
  );
};

export default SamplerSettings;
