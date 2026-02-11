import { memo } from 'react';
import SamplerSlider from '../components/SamplerSlider';
//import useSamplerSettings from '../hooks/useSamplerSettings';
import Divider from '../../../../components/common/Divider/Divider';

const TextCompletionSamplerSettings = () => {
  /*const { samplers, samplerOptions } = useSamplerSettings({
    samplerKind: 'text_completion',
  });*/
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold mb-4">Text Completion </h2>
      </div>

      <div className="flex">
        <SamplerSlider
          label="Response Length (tokens)"
          value={1000}
          onChange={(v) => console.log('Response Length', v)}
        />
        <SamplerSlider
          label="Context (tokens)"
          value={32768}
          onChange={(v) => console.log('Context', v)}
        />
      </div>

      <Divider />
    </>
  );
};

export default memo(TextCompletionSamplerSettings);
