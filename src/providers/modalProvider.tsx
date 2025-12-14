import {
  useCallback,
  createContext,
  useState,
  Suspense,
  useEffect,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

export const ModalContext = createContext<{
  openModal: (modal: ReactNode) => void;
  closeModal: () => void;
}>({
  openModal: () => {},
  closeModal: () => {},
});

const ModalShell = ({
  children,
  isVisible,
  onClose,
}: {
  children: ReactNode;
  isVisible: boolean;
  onClose: () => void;
}) => {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`
        fixed w-dvw h-dvh inset-0 z-60 flex items-center justify-center p-4
        transition-all duration-200 ease-out
        ${
          isVisible
            ? 'bg-black/60 backdrop-blur-[2px] opacity-100'
            : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
        }
      `}
    >
      <div
        className={` w-full max-w-lg h-full max-h-[85vh] relative
          transition-all duration-200 ease-out transform
          ${
            isVisible
              ? 'scale-100 translate-y-0 opacity-100'
              : 'scale-95 translate-y-4 opacity-0'
          }
        `}
      >
        {children}
      </div>
    </div>
  );
};

export function ModalProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const openModal = useCallback((modal: ReactNode) => {
    setTimeout(() => setIsVisible(true), 10);
    setContent(modal);
  }, []);

  const closeModal = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setContent(null);
    }, 200);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  const container = document.getElementById('discordia-root') || document.body;

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {content &&
        createPortal(
          <ModalShell isVisible={isVisible} onClose={closeModal}>
            <Suspense
              fallback={<div className="p-4 text-center">Loading...</div>}
            >
              {content}
            </Suspense>
          </ModalShell>,
          container,
        )}
      {children}
    </ModalContext.Provider>
  );
}

export default ModalProvider;
