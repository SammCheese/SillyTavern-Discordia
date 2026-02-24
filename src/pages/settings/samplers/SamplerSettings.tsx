import { lazy, useEffect } from 'react';

const SettingsFrame = lazy(() => import('../base/Base'));
const TextCompletionSamplerSettings = lazy(
  () => import('./kinds/TextCompletion'),
);

const { saveSettingsDebounced } = await imports('@script');

const SamplerSettings = () => {
  useEffect(() => {
    return () => {
      saveSettingsDebounced();
    };
  }, []);

  return (
    <SettingsFrame title="Sampler Settings">
      <div className="settings-section">
        <TextCompletionSamplerSettings />
      </div>
    </SettingsFrame>
  );
};

export default SamplerSettings;
