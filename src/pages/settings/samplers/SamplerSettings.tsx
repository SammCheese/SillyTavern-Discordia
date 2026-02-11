import { lazy, useEffect } from 'react';

const SettingsFrame = lazy(() => import('../base/Base'));
/*const TextCompletionSamplerSettings = lazy(
  () => import('./kinds/TextCompletion'),
);*/

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
        <div className="text-2xlxl text-gray-500 text-center mt-20">
          <span>Nothing to see here yet!</span>
          <br />
          <span>Check back later.</span>
        </div>
      </div>
    </SettingsFrame>
  );
};

export default SamplerSettings;
