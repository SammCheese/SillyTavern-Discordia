import { lazy, useMemo } from 'react';
import type { MainAPIValues } from '../connection/services/connectionManager';

const SettingsFrame = lazy(() => import('../base/Base'));
const TextCompletionSamplerSettings = lazy(
  () => import('./kinds/TextCompletion'),
);

const SamplerSettings = () => {
  const isTextCompletion = useMemo(() => {
    return (
      (SillyTavern.getContext().mainApi as MainAPIValues) ===
      'textgenerationwebui'
    );
  }, []);

  return (
    <SettingsFrame title="Sampler Settings">
      <div className="settings-section">
        {isTextCompletion ? (
          <TextCompletionSamplerSettings />
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
