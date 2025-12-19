import { type ReactNode, useCallback, useState, memo, useEffect } from 'react';

interface AccordionProps {
  title: string | ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  children: ReactNode;
  destroyOnClose?: boolean;
}

export const Accordion = ({
  title,
  isOpen = false,
  onToggle,
  children,
  destroyOnClose = false,
}: AccordionProps) => {
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
    if (onToggle) {
      onToggle();
    }
  }, [onToggle]);

  return (
    <div className="accordion rounded mb-4 border border-base-discordia-lighter overflow-hidden">
      <button
        className="accordion-header cursor-pointer w-full flex justify-between items-center p-2 bg-accordion-header hover:bg-lighter transition-colors duration-200"
        onClick={handleToggle}
      >
        <span className="text-lg font-medium">{title}</span>
        <span
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <div className="fa fa-chevron-down" />
        </span>
      </button>

      <div
        className={`accordion-content bg-input-bg transition-all duration-200 ${
          open ? 'block p-4' : 'hidden'
        }`}
      >
        {(open || !destroyOnClose) && children}
      </div>
    </div>
  );
};

export default memo(Accordion);
