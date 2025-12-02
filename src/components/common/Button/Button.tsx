import React from 'react';

const Button = ({
  label,
  onClick,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  const handleClick = React.useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);

  return (
    <button
      className="px-4 py-2 text-white border hover:border-blue-500 cursor-pointer rounded disabled:opacity-50"
      onClick={handleClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default React.memo(Button);
