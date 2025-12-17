import { type ReactNode, useCallback, useState, memo } from 'react';

interface AccordionProps {
  title: string | ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}

export const Accordion = ({
  title,
  isOpen = false,
  onToggle,
  children,
}: AccordionProps) => {
  const [open, setOpen] = useState(isOpen);

  const handleToggle = useCallback(() => {
    setOpen(!open);
    if (onToggle) {
      onToggle();
    }
  }, [open, onToggle]);

  return (
    <div className="accordion rounded mb-4 border border-base-discordia-lighter overflow-hidden">
      <button
        className="accordion-header cursor-pointer w-full flex justify-between items-center p-2 bg-accordion-header hover:bg-lighter transition-colors duration-200"
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
        <div className="accordion-content p-4 bg-input-bg">{children}</div>
      )}
    </div>
  );
};

export default memo(Accordion);
