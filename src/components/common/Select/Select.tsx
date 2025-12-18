import { type FC, type ChangeEvent, memo, useCallback } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string | number;
  onChange?: (value: string | number) => void;
  disabled?: boolean;
}

const Select: FC<SelectProps> = ({
  options = [],
  value,
  onChange,
  disabled,
}) => {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    },
    [onChange],
  );

  return (
    <select
      className="border border-gray-300 rounded bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
      value={value}
      onChange={handleChange}
      disabled={disabled}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default memo(Select);
