import React from 'react';

export const Accordion = ({
  title,
  isOpen = false,
  onToggle,
  children,
}: {
  title: string;
  isOpen?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(isOpen);

  const handleToggle = () => {
    setOpen(!open);
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <div className="accordion border border-gray-700 rounded mb-4">
      <button
        className="accordion-header cursor-pointer w-full flex justify-between items-center p-2 bg-gray-900 hover:bg-gray-800"
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
        <div className="accordion-content p-4 bg-gray-800">{children}</div>
      )}
    </div>
  );
};

export default Accordion;
