import {
  useCallback,
  createContext,
  useState,
  useRef,
  Suspense,
  useEffect,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';

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
  onClose: () => void;
}

const ModalShell = ({
  children,
  isVisible,
  isTop,
  zIndex,
  onClose,
}: ModalShellProps) => {
  const handleClick = useCallback(
    (e) => {
      if (isTop && e.target === e.currentTarget) {
        onClose();
      }
    },
    [isTop, onClose],
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
    setStack((s) => [...s, { id, node: modal }]);
    setTimeout(() => setVisibleMap((v) => ({ ...v, [id]: true })), 10);
    return id;
  }, []);

  const closeModal = useCallback((id?: number) => {
    setStack((current) => {
      const targetId = id ?? current[current.length - 1]?.id;
      if (!targetId) return current;

      setVisibleMap((v) => ({ ...v, [targetId]: false }));

      setTimeout(() => {
        setStack((cur) => cur.filter((m) => m.id !== targetId));
        setVisibleMap((v) => {
          const next = { ...v };
          delete next[targetId];
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

  return (
    <ErrorBoundary>
      <ModalContext.Provider value={{ openModal, closeModal, closeAll }}>
        {stack.length > 0 &&
          createPortal(
            stack.map(({ id, node }, idx) => (
              <ModalShell
                key={id}
                isVisible={!!visibleMap[id]}
                isTop={idx === stack.length - 1}
                zIndex={60 + idx}
                onClose={() => closeModal(id)}
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
