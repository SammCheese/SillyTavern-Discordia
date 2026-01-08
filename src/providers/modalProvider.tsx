import {
  useCallback,
  createContext,
  useState,
  useRef,
  Suspense,
  useEffect,
  type ReactNode,
  useContext,
} from 'react';
import { createPortal } from 'react-dom';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';
import { useBackHandler } from '../hooks/useBackHandler';

export const ModalContext = createContext<{
  openModal: (modal: ReactNode) => number;
  closeModal: (id?: number) => void;
  closeAll: () => void;
}>({
  openModal: () => 0,
  closeModal: () => {},
  closeAll: () => {},
});

interface ModalShellProps {
  children: ReactNode;
  isVisible: boolean;
  isTop: boolean;
  zIndex: number;
  modalId: number;
  onClose: (id?: number) => void;
}

const ModalShell = ({
  children,
  isVisible,
  isTop,
  zIndex,
  modalId,
  onClose,
}: ModalShellProps) => {
  useBackHandler(isVisible, onClose, 200);

  const handleClick = useCallback(
    (e) => {
      if (isTop && e.target === e.currentTarget) {
        onClose(modalId);
      }
    },
    [isTop, onClose, modalId],
  );

  return (
    <div
      onClick={handleClick}
      className={`
        fixed w-dvw h-dvh inset-0 z-60 flex items-center justify-center p-4
        transition-all duration-200 ease-out
        ${
          isVisible
            ? 'bg-black/60 backdrop-blur-[2px] opacity-100'
            : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
        }
      `}
      style={{ zIndex }}
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
  const [stack, setStack] = useState<Array<{ id: number; node: ReactNode }>>(
    [],
  );
  const [visibleMap, setVisibleMap] = useState<Record<number, boolean>>({});
  const idRef = useRef(0);

  const openModal = useCallback((modal: ReactNode) => {
    const id = ++idRef.current;

    setStack((s) => {
      const prevTopId = s[s.length - 1]?.id;
      if (prevTopId) {
        setVisibleMap((v) => ({ ...v, [prevTopId]: false }));
      }
      return [...s, { id, node: modal }];
    });

    setTimeout(() => setVisibleMap((v) => ({ ...v, [id]: true })), 10);
    return id;
  }, []);

  const closeModal = useCallback((id?: number) => {
    setStack((current) => {
      const targetId = id ?? current[current.length - 1]?.id;
      if (!targetId) return current;

      setVisibleMap((v) => ({ ...v, [targetId]: false }));

      setTimeout(() => {
        setStack((cur) => {
          const next = cur.filter((m) => m.id !== targetId);
          const newTopId = next[next.length - 1]?.id;

          setVisibleMap((v) => {
            const copy = { ...v };
            delete copy[targetId];
            if (newTopId) {
              copy[newTopId] = true;
            }
            return copy;
          });

          return next;
        });
      }, 200);

      return current;
    });
  }, []);

  const closeAll = useCallback(() => {
    setVisibleMap({});
    setTimeout(() => setStack([]), 200);
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

  const handleClose = useCallback(
    (id?: number) => {
      closeModal(id);
    },
    [closeModal],
  );

  return (
    <ErrorBoundary>
      <ModalContext.Provider value={{ openModal, closeModal, closeAll }}>
        {stack.length > 0 &&
          createPortal(
            stack.map(({ id, node }, idx) => (
              <ModalShell
                modalId={id}
                key={id}
                isVisible={!!visibleMap[id]}
                isTop={idx === stack.length - 1}
                zIndex={60 + idx}
                onClose={handleClose}
              >
                <Suspense
                  fallback={<div className="p-4 text-center">Loading...</div>}
                >
                  {node}
                </Suspense>
              </ModalShell>
            )),
            container,
          )}
        {children}
      </ModalContext.Provider>
    </ErrorBoundary>
  );
}

export default ModalProvider;

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
