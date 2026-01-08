import { useCallback, memo, type ReactNode, useMemo } from 'react';

export enum ButtonLook {
  DANGER = 'danger',
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TRANSPARENT = 'transparent',
  SUCCESS = 'success',
}
interface ButtonProps {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
  look?: ButtonLook;
}

const Button = ({
  label,
  onClick,
  children,
  disabled = false,
  look = ButtonLook.PRIMARY,
}: ButtonProps) => {
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);

  const getButtonClass = useCallback(() => {
    switch (look) {
      case ButtonLook.DANGER:
        return 'bg-red-600 hover:bg-red-700 border-red-700';
      case ButtonLook.SECONDARY:
        return 'bg-gray-600 hover:bg-gray-700 border-gray-700';
      case ButtonLook.PRIMARY:
        return 'hover:bg-blurple-lighter bg-blurple border-blurple';
      case ButtonLook.TRANSPARENT:
        return 'bg-transparent hover:border-blurple border-white';
      case ButtonLook.SUCCESS:
        return 'bg-green-600 hover:bg-green-700 border-green-700';
      default:
        return 'hover:bg-blurple-lighter bg-blurple border-blurple';
    }
  }, [look]);

  const buttonClass = useMemo(() => getButtonClass(), [getButtonClass]);

  return (
    <button
      className={`px-4 py-2 text-white font-bold border cursor-pointer rounded disabled:opacity-50 ${buttonClass}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {label || children}
    </button>
  );
};

export default memo(Button);
