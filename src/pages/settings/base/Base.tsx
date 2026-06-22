import { memo, useCallback, type ReactNode } from 'react';
import { usePage } from '../../../providers/pageProvider';
import CloseButton from './CloseButton';
import { usePlatform } from '../../../providers/platformProvider';

interface SettingsFrameProps {
  title?: string;
  children: ReactNode;
  header?: ReactNode;
  onClose?: () => void;
  noPadding?: boolean;
}

const SettingsFrame = ({
  title,
  children,
  header,
  onClose,
  noPadding = false,
}: SettingsFrameProps) => {
  const { closePage } = usePage();
  const { isSmallScreen } = usePlatform();

  const handleClose = useCallback(() => {
    closePage(onClose);
  }, [onClose, closePage]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      onClick={handleClick}
      style={{
        backgroundColor:
          'var(--SmartThemeBlurTintColor, rgba(54, 57, 63, 0.8))',
      }}
      className="w-full h-full p-[5%]  text-white flex flex-col overflow-hidden"
    >
      <div
        className="settings-header w-full flex justify-between items-center p-4 mb-4 border-b border-gray-700 shrink-0"
        style={{
          maxWidth: isSmallScreen || noPadding ? '100%' : '800px',
          margin: '0 auto',
        }}
      >
        {title && <h2 className="text-3xl font-semibold">{title}</h2>}
        <button className="group" onClick={handleClose}>
          <CloseButton />
        </button>
      </div>
      {header && <div className="px-4 w-full">{header}</div>}

      <div
        className="settings-content w-full flex-1 overflow-x-hidden min-h-0 "
        style={{
          maxWidth: isSmallScreen || noPadding ? '100%' : '800px',
          margin: '0 auto',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default memo(SettingsFrame);
