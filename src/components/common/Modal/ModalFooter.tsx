import { memo } from 'react';

interface ModalFooterProps {
  children?: React.ReactNode;
}

const ModalFooter = ({ children }: ModalFooterProps) => {
  return (
    <div className="rounded-b-lg flex shrink-0 justify-end space-x-2 p-4 border-t border-gray-700 w-full bg-base-discordia">
      {children}
    </div>
  );
};

export default memo(ModalFooter);
