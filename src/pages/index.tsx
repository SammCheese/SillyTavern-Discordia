import React from 'react';

interface OpenPageProps {
  children: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
}

const OpenPage = ({ children, isVisible, onClose }: OpenPageProps) => {
  return (
    <div
      id="open-page-container"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`        ${
        isVisible
          ? 'bg-black/80 backdrop-blur-sm opacity-100'
          : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
      } fixed inset-0 w-dvw h-dvh z-50 flex flex-col justify-center items-center text-white transition-all duration-200 ease-out`}
    >
      <div
        className={`
          transition-all duration-300 ease-out transform
          ${
            isVisible
              ? 'scale-100 translate-y-0 opacity-100'
              : 'scale-95 translate-y-4 opacity-0'
          }
          w-full h-full flex justify-center items-center pointer-events-auto
        `}
      >
        {children}
      </div>
    </div>
  );
};

export default OpenPage;
