import { memo, useCallback } from 'react';
import type { SamplerConfig } from '../data/samplers';
import Checkbox from '../../../../components/common/Checkbox/Checkbox';
import SamplerSlider from './SamplerSlider';

type SamplerValue = number | boolean | string;

interface SettingsRowProps {
  settings: SamplerConfig[];
  onChange?: (id: string, value: SamplerValue) => void;
  values?: Partial<Record<string, unknown>>;
}

const SettingsRow = ({ settings, values, onChange }: SettingsRowProps) => {
  const onChangeWrapper = useCallback(
    (id: string, value: SamplerValue) => {
      onChange?.(id, value);
    },
    [onChange],
  );

  const boolSettings = settings.filter((s) => s.type === 'boolean');
  const otherSettings = settings.filter((s) => s.type !== 'boolean');

  return (
    <>
      <div className="flex flex-row gap-4 justify-center w-full">
        {boolSettings.map((s) => (
          <div
            key={s.id}
            className="items-center gap-2 mb-4 w-fit flex-row flex"
          >
            <Checkbox
              checked={Boolean(values?.[s.id])}
              label={s.name}
              onChange={(v) => onChangeWrapper(s.id, v)}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-row flex-wrap justify-center gap-4 w-full">
        {otherSettings.map((setting) => (
          <SamplerSlider
            key={`${setting.id}-${String(values?.[setting.id] ?? setting.min ?? 0)}`}
            label={setting.name}
            value={Number(values?.[setting.id] ?? setting.min ?? 0)}
            min={setting.min}
            max={setting.max}
            step={setting.step}
            onChange={(v) => onChangeWrapper(setting.id, v)}
          />
        ))}
      </div>
    </>
  );
};

export default memo(SettingsRow);
