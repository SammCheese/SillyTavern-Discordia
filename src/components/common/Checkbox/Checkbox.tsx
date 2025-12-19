import {
  useState,
  useCallback,
  useEffect,
  type ChangeEvent,
  memo,
} from 'react';

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

const Checkbox = ({ label, checked = false, onChange }: CheckboxProps) => {
  const [checkedState, setCheckedState] = useState(checked);

  const toggleCheckbox = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      const newCheckedState = !checkedState;
      setCheckedState(newCheckedState);
      if (onChange) {
        onChange(newCheckedState);
      }
    },
    [checkedState, onChange],
  );

  useEffect(() => {
    setCheckedState(checked);
  }, [checked]);

  return (
    <div className="flex items-center gap-2">
      <label className="inline-flex items-center cursor-pointer relative">
        <input
          type="checkbox"
          className="appearance-none opacity-0 w-6 h-6 left-0 m-0 p-0 top-0"
          style={{
            height: '24px !important',
            width: '24px !important',
            position: 'absolute',
          }}
          checked={checkedState}
          onChange={toggleCheckbox}
        />
        <div
          className={`w-6 h-6  rounded flex items-center justify-center cursor-pointer ${checkedState ? 'border-blurple' : 'border-white'} hover:border-blurple border-2`}
          style={{
            backgroundColor: checkedState
              ? 'var(--color-blurple)'
              : 'transparent',
            border: checkedState ? 'none' : '2px solid var(--color-white)',
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <svg
            aria-hidden="true"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              fill={checkedState ? 'white' : 'transparent'}
              fillRule="evenodd"
              d="M19.06 6.94a1.5 1.5 0 0 1 0 2.12l-8 8a1.5 1.5 0 0 1-2.12 0l-4-4a1.5 1.5 0 0 1 2.12-2.12L10 13.88l6.94-6.94a1.5 1.5 0 0 1 2.12 0Z"
              clipRule="evenodd"
            ></path>
          </svg>
        </div>
        <span className="ml-2 text-gray-200">{label}</span>
      </label>
    </div>
  );
};

export default memo(Checkbox);
