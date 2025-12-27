import { memo, useCallback } from 'react';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
}

const Slider = ({ min, max, step, value, onChange }: SliderProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(Number(e.target.value));
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-4">
        <input
          type="range"
          className="w-full h-2 bg-base-discordia-lighter rounded-lg appearance-none cursor-pointer range-thumb:hover:scale-110 transition-all"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
        />
        <div className="w-16 text-center">
          <input
            type="number"
            className="w-full bg-base-discordia-lighter text-white text-center rounded-md p-1 border border-gray-600"
            value={value}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(Slider);
