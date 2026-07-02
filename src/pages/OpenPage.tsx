import { memo, useCallback, type ReactNode } from 'react';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';

interface OpenPageProps {
  children: ReactNode;
  isVisible: boolean;
  onClose: () => void;
}

const OpenPage = ({ children, isVisible, onClose }: OpenPageProps) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <div
      id="open-page-container"
      onClick={handleClick}
      className={`${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } bg-black/80 backdrop-blur-sm fixed inset-0 w-dvw h-dvh z-50 flex flex-col justify-center items-center text-white transition-opacity duration-200 ease-out`}
    >
      <div
        className={`
          transition-[transform,opacity] duration-300 ease-out transform
          ${
            isVisible
              ? 'scale-100 translate-y-0 opacity-100'
              : 'scale-95 translate-y-4 opacity-0'
          }
          w-full h-full flex justify-center items-center pointer-events-auto
        `}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
};

export default memo(OpenPage);
