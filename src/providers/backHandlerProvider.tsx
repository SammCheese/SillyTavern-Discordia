import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

type BackCallback = () => void;

type BackHandlerEntry = {
  id: string;
  callback: BackCallback;
  timeout: number;
};

interface BackHandlerProvider {
  register: (id: string, callback: BackCallback, timeout?: number) => void;
  unregister: (id: string) => void;
}

export const BackHandlerContext = createContext<BackHandlerProvider>({
  register: () => {},
  unregister: () => {},
});

export const BackHandlerProvider = ({ children }: { children: ReactNode }) => {
  const stackRef = useRef<BackHandlerEntry[]>([]);
  const beforeUnloadAttachedRef = useRef(false);
  const resetTimerRef = useRef<number | null>(null);

  const beforeUnloadHandler = useCallback((e: BeforeUnloadEvent) => {
    e.preventDefault();
  }, []);

  const detachBeforeUnload = useCallback(() => {
    if (stackRef.current.length === 0 && beforeUnloadAttachedRef.current) {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      beforeUnloadAttachedRef.current = false;
    }
  }, [beforeUnloadHandler]);

  const register = useCallback(
    (id: string, callback: BackCallback, timeout: number = 80) => {
      if (stackRef.current.some((entry) => entry.id === id)) return;

      stackRef.current.push({ id, callback, timeout });
      window.history.pushState({ handlerId: id }, '', '');

      if (!beforeUnloadAttachedRef.current) {
        window.addEventListener('beforeunload', beforeUnloadHandler);
        beforeUnloadAttachedRef.current = true;
      }
    },
    [beforeUnloadHandler],
  );

  const unregister = useCallback(
    (id: string) => {
      const index = stackRef.current.findIndex((entry) => entry.id === id);
      if (index === -1) return;

      stackRef.current.splice(index, 1);
      detachBeforeUnload();
    },
    [detachBeforeUnload],
  );

  useEffect(() => {
    const handlePopState = () => {
      if (stackRef.current.length === 0) return;

      // Remove the top entry immediately so rapid back presses walk the stack correctly.
      const entry = stackRef.current.pop();
      detachBeforeUnload();

      if (!entry) return;

      entry.callback();

      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }

      resetTimerRef.current = window.setTimeout(() => {
        resetTimerRef.current = null;
      }, entry.timeout ?? 80);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      beforeUnloadAttachedRef.current = false;

      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, [beforeUnloadHandler, detachBeforeUnload]);

  return (
    <BackHandlerContext.Provider value={{ register, unregister }}>
      {children}
    </BackHandlerContext.Provider>
  );
};
