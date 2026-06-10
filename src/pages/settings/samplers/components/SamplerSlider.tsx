import { memo } from 'react';
import Slider from '../../../../components/common/Slider/Slider';
import Tooltip from '../../../../components/common/Tooltip/Tooltip';

interface SamplerSliderProps {
  label: string;
  tooltip?: string;
  value: number;
  min?: number;
  max?: number | null;
  step?: number;
  onChange: (value: number) => void;
}

const SamplerSlider = ({
  label,
  tooltip,
  value,
  min,
  max,
  step,
  onChange,
}: SamplerSliderProps) => {
  return (
    <div className="flex flex-col mb-4 w-fit ">
      <div className="flex justify-center gap-2">
        <label className="mb-2 text-sm font-medium text-center">{label}</label>
        {tooltip && (
          <Tooltip text={tooltip}>
            <i className="fa-solid fa-circle-question text-gray-400" />
          </Tooltip>
        )}
      </div>
      <Slider
        value={value}
        min={min}
        max={max ?? undefined}
        step={step}
        onChange={onChange}
      />
    </div>
  );
};

export default memo(SamplerSlider);
