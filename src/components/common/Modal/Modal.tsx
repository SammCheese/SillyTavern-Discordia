import { memo, type ReactNode } from 'react';
import ModalContent from './ModalContent';
import ModalFooter from './ModalFooter';
import ModalHeader from './ModalHeader';

interface ModalProps {
  children: ReactNode;
  className?: string;
}

const Modal = memo(({ children, className = '' }: ModalProps) => {
  return (
    <div
      className={`flex flex-col w-full h-full
        bg-base-discordia rounded-lg shadow-2xl border border-gray-700
        overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}) as typeof ModalContent & {
  Header: typeof ModalHeader;
  Content: typeof ModalContent;
  Footer: typeof ModalFooter;
};

Modal.displayName = 'Modal';

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export default Modal;
