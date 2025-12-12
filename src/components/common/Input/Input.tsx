import {
  type CSSProperties,
  useState,
  useCallback,
  type ChangeEvent,
  memo,
  useEffect,
  useRef,
} from 'react';

interface InputProps {
  placeholder?: string;
  label?: string;
  defaultValue?: string | number | undefined;
  value?: string | number | undefined;
  onChange: (value: string) => void;
  type?: string;
  style?: CSSProperties;
  disabled?: boolean;
  id?: string;
  growHeight?: boolean;
}

const Input = ({
  placeholder = '',
  defaultValue = '',
  value,
  label = '',
  onChange,
  style,
  disabled = false,
  id = '',
  type = 'text',
  growHeight = false,
}: InputProps) => {
  const [content, setContent] = useState(value ?? defaultValue ?? '');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setContent(value);
    }
  }, [value]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setContent(newValue);
      onChange(newValue);
    },
    [onChange],
  );

  useEffect(() => {
    if (growHeight && textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [content, growHeight]);

  return (
    <div className={`flex flex-col w-full gap-1 `} style={style}>
      {label && (
        <label className="text-sm font-medium mb-1" htmlFor={id}>
          {label}
        </label>
      )}
      {growHeight ? (
        <textarea
          ref={textAreaRef}
          id={id}
          disabled={disabled}
          className="input-field max-h-40 w-full px-3 py-2 bg-input-bg rounded-md outline outline-input-outline focus:ring-2 focus:ring-input-ring resize-none text-wrap wrap-break-word"
          placeholder={placeholder}
          value={content}
          onChange={handleInputChange}
          rows={1}
        />
      ) : (
        <input
          contentEditable={growHeight}
          id={id}
          disabled={disabled}
          className="input-field w-full px-3 py-2 bg-input-bg rounded-md outline outline-input-outline focus:ring-2 focus:ring-input-ring"
          placeholder={placeholder}
          type={type}
          value={content}
          onChange={handleInputChange}
        />
      )}
    </div>
  );
};

export default memo(Input);
