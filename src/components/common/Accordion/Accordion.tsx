import { type ReactNode, useCallback, useState, memo } from 'react';

export const Accordion = ({
  title,
  isOpen = false,
  onToggle,
  children,
}: {
  title: string;
  isOpen?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(isOpen);

  const handleToggle = useCallback(() => {
    setOpen(!open);
    if (onToggle) {
      onToggle();
    }
  }, [open, onToggle]);

  return (
    <div className="accordion border-none rounded mb-4">
      <button
        style={{ backgroundColor: 'var(--accordion-header-bg)' }}
        className="accordion-header cursor-pointer w-full flex justify-between items-center p-2 hover:bg-gray-900 transition-colors duration-200"
        onClick={handleToggle}
      >
        <span className="text-lg font-medium">{title}</span>
        <span>
          {open ? (
            <div className="fa fa-chevron-up"></div>
          ) : (
            <div className="fa fa-chevron-down"></div>
          )}
        </span>
      </button>
      {open && (
        <div className="accordion-content p-4 bg-gray-900">{children}</div>
      )}
    </div>
  );
};

export default memo(Accordion);
