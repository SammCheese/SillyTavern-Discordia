import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';
import BottomSheet from '../components/common/BottomSheet/BottomSheet';
import { useBackHandler } from '../hooks/useBackHandler';

export interface BottomSheetOptions {
  maxRatio?: number;
  showHandle?: boolean;
  onClose?: () => void;
}

interface BottomSheetContextType {
  openBottomSheet: (content: ReactNode, options?: BottomSheetOptions) => void;
  closeBottomSheet: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextType | null>(null);

const EXIT_ANIMATION_MS = 250;

export const BottomSheetProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<BottomSheetOptions>({});
  const [isVisible, setIsVisible] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const optionsRef = useRef<BottomSheetOptions>({});

  const openBottomSheet = useCallback(
    (node: ReactNode, opts: BottomSheetOptions = {}) => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      optionsRef.current = opts;
      setContent(node);
      setOptions(opts);

      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsVisible(true)),
      );
    },
    [],
  );

  const closeBottomSheet = useCallback(() => {
    setIsVisible(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setContent(null);
      setOptions({});
      optionsRef.current.onClose?.();
      optionsRef.current = {};
    }, EXIT_ANIMATION_MS);
  }, []);

  useBackHandler(isVisible, closeBottomSheet);

  const contextValue = useMemo(
    () => ({ openBottomSheet, closeBottomSheet }),
    [openBottomSheet, closeBottomSheet],
  );

  return (
    <ErrorBoundary>
      <BottomSheetContext value={contextValue}>
        {content !== null && (
          <BottomSheet
            open={isVisible}
            onClose={closeBottomSheet}
            maxRatio={options.maxRatio}
            showHandle={options.showHandle}
          >
            <ErrorBoundary>{content}</ErrorBoundary>
          </BottomSheet>
        )}
        {children}
      </BottomSheetContext>
    </ErrorBoundary>
  );
};

export const useBottomSheet = () => {
  const context = use(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
};

export default BottomSheetProvider;
