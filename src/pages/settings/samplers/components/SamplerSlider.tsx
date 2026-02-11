import { memo } from 'react';
import Slider from '../../../../components/common/Slider/Slider';

interface SamplerSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

const SamplerSlider = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: SamplerSliderProps) => {
  return (
    <div className="flex flex-col mb-4 w-1/2 ">
      <label className="mb-2 text-sm font-medium text-center">{label}</label>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
      />
    </div>
  );
};

export default memo(SamplerSlider);
