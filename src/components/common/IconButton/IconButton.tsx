import { memo, useCallback } from 'react';

interface IconButtonProps {
  faIcon: string;
  size?: number;
  onClick?: () => void;
  tooltip?: string;
  disabled?: boolean;
  color?: string;
}

const IconButton = ({
  faIcon,
  size = 24,
  onClick,
  tooltip,
  disabled = false,
  color,
}: IconButtonProps) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick?.();
    }
  }, [onClick, disabled]);

  return (
    <button
      className={`
        flex items-center justify-center
        ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-700 cursor-pointer'}
        rounded p-2 border border-base-discordia-lighter hover:border-gray-500 transition-all
      `}
      style={{ width: size + 16, height: size + 16 }}
      onClick={handleClick}
      title={tooltip}
      aria-label={tooltip}
    >
      <div className={`text-${size}px ${faIcon}`} style={{ color }} />
    </button>
  );
};

export default memo(IconButton);
