import { memo, useCallback } from 'react';
import IconButton from '../../../../../components/common/IconButton/IconButton';

interface TitleProps {
  title: string;
  disabled: boolean;
  hasSettings: boolean;
  hasUpdates: boolean;
  onUpdateClick?: () => void;
  isUpdating?: boolean;
}

const ExtensionTitle = ({
  title,
  disabled,
  hasSettings,
  hasUpdates,
  onUpdateClick,
  isUpdating = false,
}: TitleProps) => {
  const handleUpdateClick = useCallback(
    (event) => {
      if (isUpdating) return;
      event.stopPropagation();
      onUpdateClick?.();
    },
    [isUpdating, onUpdateClick],
  );

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        {hasSettings && (
          <div className="fa fa-solid fa-cog" title="Has Settings" />
        )}

        <label
          title={`${title}${disabled ? ' (Disabled)' : ''}`}
          className="text-lg font-medium"
          style={{ opacity: disabled ? 0.5 : 1 }}
        >
          {title}
        </label>
      </div>
      <div className="flex items-center gap-2 ml-auto mr-2">
        {hasUpdates && (
          <IconButton
            size={18}
            faIcon="fa fa-solid fa-download"
            color="#4ade80"
            tooltip="Update Available"
            onClick={handleUpdateClick}
            disabled={isUpdating}
          />
        )}
      </div>
    </div>
  );
};

export default memo(ExtensionTitle);
