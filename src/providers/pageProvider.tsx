import React from 'react';
import { createPortal } from 'react-dom';
import OpenPage from '../pages/index';
import { rootContainer } from '../index';


export const PageContext = React.createContext<{
  openPage: (page: React.ReactNode) => void;
  closePage: () => void;
}>({
  openPage: () => {},
  closePage: () => {},
});

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = React.useState<React.ReactNode>(null);

  const openPage = (page: React.ReactNode) => {
    setCurrentPage(page);
  };

  const closePage = () => {
    setCurrentPage(null);
  };

  // Close page on Escape key press or click outside
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePage();
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (currentPage && target && !(rootContainer?.contains(target))) {
        closePage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [currentPage]);

  return (
    <PageContext.Provider value={{ openPage, closePage }}>
      {currentPage &&
        createPortal(
          <div className="">
            <OpenPage>{currentPage}</OpenPage>
          </div>,
          rootContainer
        )}
      {children}
    </PageContext.Provider>
  );
}
