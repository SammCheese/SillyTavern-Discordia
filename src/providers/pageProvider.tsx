import React, { useCallback } from 'react';
import { createPortal } from 'react-dom';

import { rootContainer } from '../index';

const OpenPage = React.lazy(() => import('../pages/index'));

export const PageContext = React.createContext<{
  openPage: (page: React.ReactNode) => void;
  closePage: () => void;
}>({
  openPage: () => {},
  closePage: () => {},
});

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = React.useState<React.ReactNode>(null);
  const [isVisible, setIsVisible] = React.useState<boolean>(false);

  const openPage = useCallback((page: React.ReactNode) => {
    setIsVisible(false);
    setContent(page);
  }, []);

  React.useEffect(() => {
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

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePage();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closePage]);

  return (
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
  );
}
