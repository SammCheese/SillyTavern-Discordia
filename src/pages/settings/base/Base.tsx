import { memo, useCallback, useMemo, type ReactNode } from 'react';
import { usePage } from '../../../providers/pageProvider';
import CloseButton from './CloseButton';

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
  const { closePage } = usePage();

  const handleClose = useCallback(() => {
    if (onClose) onClose();
    closePage();
  }, [onClose, closePage]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const isSmallScreen = useMemo(() => window.innerWidth < 1000, []);

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
