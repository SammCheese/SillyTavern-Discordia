import { type ReactNode } from 'react';
import ModalContent from './ModalContent';
import ModalFooter from './ModalFooter';
import ModalHeader from './ModalHeader';

interface ModalProps {
  children: ReactNode;
  className?: string;
}

const Modal = ({ children, className = '' }: ModalProps) => {
  return (
    <div
      className={`flex flex-col w-full h-full
        bg-base-discordia rounded-lg shadow-2xl border border-gray-700
        overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export default Modal;
