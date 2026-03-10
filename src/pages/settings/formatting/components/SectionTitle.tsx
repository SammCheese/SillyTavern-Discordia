import { memo, useCallback } from 'react';
import IconButton from '../../../../components/common/IconButton/IconButton';

interface SectionTitleProps {
  title: string;
  onClick?: () => void;
  enabled: boolean;
}

const SectionTitle = ({ title, onClick, enabled }: SectionTitleProps) => {
  const handleToggle = useCallback(
    (e) => {
      e.stopPropagation();
      onClick?.();
    },
    [onClick],
  );

  return (
    <div className="flex items-center gap-2">
      <IconButton
        faIcon="fa-solid fa-power-off"
        color={enabled ? '#f87171' : '#4ade80'}
        onClick={handleToggle}
      />
      <span
        className="text-lg font-bold"
        style={{ color: enabled ? 'white' : 'gray' }}
      >
        {title} {enabled ? '' : '(Disabled)'}
      </span>
    </div>
  );
};

export default memo(SectionTitle);
