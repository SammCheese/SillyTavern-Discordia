import { memo, useCallback, useMemo, useState } from 'react';

interface SliderProps {
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  value?: number | undefined;
  onChange?: (value: number) => void;
}

const _ = window._;

const Slider = ({ min, max, step, value, onChange }: SliderProps) => {
  const [, setVal] = useState<number>(value || 0);
  const [localValue, setLocalValue] = useState<string>(String(value || 0));

  const debouncedOnChange = useMemo(
    () =>
      _.debounce((value: number) => {
        onChange?.(value);
      }, 1500),
    [onChange],
  );

  const doLocalChange = useCallback(
    (e) => {
      if (isNaN(Number(e.target.value))) return;
      setLocalValue(e.target.value);
    },
    [setLocalValue],
  );

  const handleChange = useCallback(() => {
    if (isNaN(Number(localValue))) return;
    let newValue: number = Number(localValue);

    if (min !== undefined && Number(localValue) < min) newValue = min;
    if (max !== undefined && Number(localValue) > max) newValue = max;

    setVal(newValue);
    setLocalValue(String(newValue));
    debouncedOnChange(newValue);
  }, [debouncedOnChange, localValue, max, min]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-center gap-1">
        <input
          type="range"
          className="discordia-slider w-full h-2.5 bg-base-discordia-lighter rounded-lg appearance-none cursor-pointer range-thumb:hover:scale-120  transition-all"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={doLocalChange}
          onPointerUp={handleChange}
        />

        <div className="w-full text-center">
          <input
            type="number"
            className="w-full bg-base-discordia-lighter text-white text-center rounded-md p-1 border border-gray-600"
            value={localValue}
            onChange={doLocalChange}
            onInput={doLocalChange}
            onBlur={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(Slider);
