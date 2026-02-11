import { useState } from 'react';

const { setting_names } = await imports('@scripts/textGenSettings');

type SamplerOption = {
  key: string;
  name: string;
  constraints?: {
    min?: number;
    max?: number;
    step?: number;
  };
};

/*interface UseSamplerSettingsProps {
  samplerKind: 'text_completion' | 'chat_completion' | string;
}*/

const useSamplerSettings = () => {
  const [samplerOptions] = useState<SamplerOption[]>([]);

  const valuesToRemove = new Set([
    'streaming',
    'bypass_status_check',
    'custom_model',
    'legacy_api',
    'extensions',
  ]);

  const samplers = Object.entries(setting_names)
    .filter(([key]) => !valuesToRemove.has(key))
    .map(([key, value]) => ({
      key,
      name: value,
    }));

  return {
    samplers,
    samplerOptions,
  };
};

export default useSamplerSettings;
