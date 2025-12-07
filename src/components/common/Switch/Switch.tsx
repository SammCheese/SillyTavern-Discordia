import { useState, useCallback, memo } from 'react';

interface ToggleProps {
  isOn: boolean;
  onToggle?: () => void;
  onColor?: string;
}

const Toggle = ({
  isOn,
  onToggle,
  onColor = 'var(--color-blurple)',
}: ToggleProps) => {
  const [onState, setOnState] = useState(isOn);

  const handleToggle = useCallback(() => {
    setOnState(!onState);
    if (onToggle) {
      onToggle();
    }
  }, [onState, onToggle]);

  return (
    <div
      onClick={handleToggle}
      style={{
        cursor: 'pointer',
        width: '50px',
        height: '25px',
        borderRadius: '15px',
        backgroundColor: onState ? onColor : '#ccc',
        position: 'relative',
        transition: 'background-color 0.2s',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '2.5px',
          left: onState ? '27.5px' : '2.5px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 0 2px rgba(0, 0, 0, 0.2)',
        }}
      ></div>
    </div>
  );
};

export default memo(Toggle);
