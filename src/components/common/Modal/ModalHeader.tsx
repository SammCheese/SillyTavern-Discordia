import { memo, useContext } from 'react';
import { ModalContext } from '../../../providers/modalProvider';

interface ModalHeaderProps {
  title?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  canClose?: boolean;
}

const ModalHeader = ({
  title,
  onClose,
  children,
  canClose = true,
}: ModalHeaderProps) => {
  const { closeModal } = useContext(ModalContext);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    closeModal();
  };

  return (
    <div className="px-4 py-4 shrink-0 border-b border-gray-700 flex items-center justify-between w-full">
      <div className="text-lg font-semibold m-0">{title ?? children}</div>
      <div className="flex items-center">
        {canClose && (
          <button
            onClick={handleClose}
            className="text-gray-400  hover:text-white cursor-pointer focus:outline-none"
            aria-label="Close modal"
          >
            &#10005;
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(ModalHeader);
