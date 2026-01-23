import { memo, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { PageContext } from '../../../providers/pageProvider';

const CloseButton = memo(function CloseButton() {
  return (
    <>
      <div
        style={{ flex: '0 0 36px' }}
        className="group-hover:border-gray-50 items-center rounded-full border-2 border-gray-600 cursor-pointer w-9 h-9 flex justify-center box-border"
      >
        <svg
          aria-hidden="true"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z"
          ></path>
        </svg>
      </div>
      <div className="group-hover:text-gray-50 text-center mt-1 text-xs text-gray-400">
        ESC
      </div>
    </>
  );
});

interface SettingsFrameProps {
  title: string;
  children: ReactNode;
  header?: ReactNode;
  onClose?: () => void;
}

const SettingsFrame = ({
  title,
  children,
  header,
  onClose,
}: SettingsFrameProps) => {
  const { closePage } = useContext(PageContext);

  const handleClose = useCallback(() => {
    if (onClose) onClose();
    closePage();
  }, [onClose, closePage]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const isSmallScreen = useMemo(
    () => window.innerWidth < 1000,
    [window.innerWidth],
  );

  return (
    <div
      onClick={handleClick}
      className="w-full h-full p-[5%] bg-base-discordia text-white flex flex-col overflow-hidden"
    >
      <div
        className="settings-header w-full flex justify-between items-center p-4 mb-4 border-b border-gray-700 shrink-0"
        style={{
          maxWidth: isSmallScreen ? '100%' : '800px',
          margin: '0 auto',
        }}
      >
        <h2 className="text-3xl font-semibold">{title}</h2>
        <button className="group" onClick={handleClose}>
          <CloseButton />
        </button>
      </div>
      <div>{header}</div>

      <div
        className="settings-content w-full flex-1 overflow-auto overflow-x-hidden min-h-0"
        style={{
          maxWidth: isSmallScreen ? '100%' : '800px',
          margin: '0 auto',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default memo(SettingsFrame);
