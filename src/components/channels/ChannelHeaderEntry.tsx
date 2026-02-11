import { memo, useCallback } from 'react';

interface ChannelHeaderEntryProps {
  icon: Icon;
  onClick?: (icon: Icon) => void;
}

const ChannelHeaderEntry = ({ icon, onClick }: ChannelHeaderEntryProps) => {
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(icon);
    }
  }, [onClick, icon]);

  return (
    <div
      className="py-2 px-2.5 select-none cursor-pointer font-bold rounded-md mr-1 w-full flex items-center gap-2 group"
      title={icon.title}
      onClick={handleClick}
    >
      <div
        style={{ fontSize: '28px' }}
        className={`${icon.className} group-hover:opacity-100`}
      />
      <div className="group-hover:text-white truncate text-gray-500">
        {icon.title}
      </div>
    </div>
  );
};

export default memo(ChannelHeaderEntry);
