import React from 'react';

interface InputProps {
  placeholder?: string;
  label?: string;
  defaultValue?: string;
  value?: string;
  onChange: (value: string) => void;
  type?: string;
  style?: React.CSSProperties;
}

const Input = ({
  placeholder = '',
  defaultValue = '',
  value,
  label = '',
  onChange,
  style,
  type = 'text',
}: InputProps) => {
  const [content, setContent] = React.useState(value || defaultValue);

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setContent(e.target.value);
      onChange(e.target.value);
    },
    [onChange],
  );

  return (
    <div className="flex flex-col w-full gap-1 " style={style}>
      {label && <label className="text-sm font-medium mb-1">{label}</label>}
      <input
        className="input-field w-full px-3 py-2 bg-input-bg rounded-md outline outline-input-outline focus:ring-2 focus:ring-input-ring"
        placeholder={placeholder}
        type={type}
        value={content}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default React.memo(Input);
