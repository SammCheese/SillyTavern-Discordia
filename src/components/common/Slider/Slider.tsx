import { memo, useCallback, useState } from 'react';

interface SliderProps {
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  value?: number | undefined;
  onChange?: (value: number) => void;
}

const _ = window._;

const Slider = ({ min, max, step, value, onChange }: SliderProps) => {
  const [val, setVal] = useState<number>(value || 0);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isNaN(Number(e.target.value))) return;
      let newValue: number = Number(e.target.value);

      if (min !== undefined && Number(e.target.value) < min) newValue = min;
      if (max !== undefined && Number(e.target.value) > max) newValue = max;
      setVal(newValue);
      _.debounce(() => onChange?.(newValue), 200)();
    },
    [max, min, onChange],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-center gap-1">
        <input
          type="range"
          className="discordia-slider w-full h-2.5 bg-base-discordia-lighter rounded-lg appearance-none cursor-pointer range-thumb:hover:scale-120  transition-all"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={handleChange}
        />

        <div className="w-full text-center">
          <input
            type="number"
            className="w-full bg-base-discordia-lighter text-white text-center rounded-md p-1 border border-gray-600"
            value={val}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(Slider);
