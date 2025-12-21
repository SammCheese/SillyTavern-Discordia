import {
  useCallback,
  lazy,
  useState,
  useEffect,
  createContext,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import { rootContainer } from '../index';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';
import { useBackHandler } from '../hooks/useBackHandler';

const OpenPage = lazy(() => import('../pages/index'));

export const PageContext = createContext<{
  openPage: (page: ReactNode) => void;
  closePage: () => void;
}>({
  openPage: () => {},
  closePage: () => {},
});

export function PageProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const openPage = useCallback((page: ReactNode) => {
    setIsVisible(false);
    setContent(page);
  }, []);

  useEffect(() => {
    if (content) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    }
  }, [content]);

  const closePage = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setContent(null);
    }, 200);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePage();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closePage]);

  useBackHandler(isVisible, closePage);

  return (
    <ErrorBoundary>
      <PageContext.Provider value={{ openPage, closePage }}>
        {content &&
          createPortal(
            <div>
              <OpenPage isVisible={isVisible} onClose={closePage}>
                {content}
              </OpenPage>
            </div>,
            rootContainer,
          )}
        {children}
      </PageContext.Provider>
    </ErrorBoundary>
  );
}
