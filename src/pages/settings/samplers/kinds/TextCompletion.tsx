import { memo } from 'react';
import SamplerSlider from '../components/SamplerSlider';
import Divider from '../../../../components/common/Divider/Divider';
import { textgen_settings_schema } from '../data/samplers';

const context = SillyTavern.getContext();

const TextCompletionSamplerSettings = () => {
  const settings = context.textCompletionSettings || {};
  //const maxContext = context.maxContext || 2048;
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold mb-4">Text Completion </h2>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        {textgen_settings_schema.Common.Generation.map((setting) => (
          <SamplerSlider
            key={setting.id}
            label={setting.name}
            value={settings[setting.id] || setting.min}
            min={setting.min}
            max={setting.max}
            step={setting.step}
            onChange={(v) => console.log(setting.name, v)}
          />
        ))}
      </div>

      <Divider />
      <div className="flex gap-4 flex-wrap">
        {Object.entries(textgen_settings_schema.TextGenWebUI).map(
          ([key, settings]) => (
            <div key={key} className="w-full text-center">
              <h3 className="text-xl font-semibold mb-2">{key}</h3>
              <div className="flex flex-row gap-4 flex-wrap justify-center">
                {settings.map((setting) => (
                  <SamplerSlider
                    key={setting.id}
                    label={setting.name}
                    value={settings[setting.id] || setting.min}
                    min={setting.min}
                    max={setting.max}
                    step={setting.step}
                    onChange={(v) => console.log(setting.name, v)}
                  />
                ))}
              </div>
              <Divider key={`${key}-divider`} />
            </div>
          ),
        )}
      </div>
    </>
  );
};

export default memo(TextCompletionSamplerSettings);
