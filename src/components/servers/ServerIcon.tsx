import { memo, useEffect, useMemo, useState } from 'react';
import GroupAvatar from '../groupAvatar/GroupAvatar';

const { getThumbnailUrl } = await imports('@script');

interface ServerIconProps {
  entity: Entity;
  isSelected: boolean;
  onSelect?: (entity: Entity, index: number) => void;
  index: number;
}

const ServerIcon = ({
  entity,
  isSelected,
  onSelect,
  index,
}: ServerIconProps) => {
  const [hovered, setHovered] = useState(false);

  // Precaution
  useEffect(() => {
    let hoverTimeout: NodeJS.Timeout;
    if (hovered) {
      hoverTimeout = setTimeout(() => {
        setHovered(false);
      }, 3000);
    }
    return () => clearTimeout(hoverTimeout);
  }, [hovered]);

  const handleClick = () => {
    if (onSelect) {
      onSelect(entity, index);
    }
  };

  const memoizedSrc = useMemo(() => {
    return getThumbnailUrl('avatar', entity.item?.avatar || entity.id);
  }, [entity]);

  return (
    <div className="flex m-0 relative w-full h-fit">
      <div className="absolute start-0 top-0 w-2 justify-start items-center flex h-full">
        <span
          style={{ borderRadius: '0 4px 4px 0' }}
          className={
            'w-2 h-0 absolute block transition ease-in-out duration-500 -ms-1 bg-white ' +
            (hovered ? ' h-6' : '') +
            (isSelected ? ' h-8' : '')
          }
        ></span>
      </div>

      <div
        onMouseEnter={() => {
          setHovered(true);
        }}
        onMouseLeave={() => {
          setHovered(false);
        }}
        onClick={handleClick}
        className="cursor-pointer w-full h-fit flex justify-center items-center"
      >
        {entity.type === 'group' ? (
          <GroupAvatar groupItem={entity.item} />
        ) : (
          <img
            loading="lazy"
            alt={entity.item?.name || 'Character'}
            className={`rounded-xl h-12 w-12 object-cover hover:outline-1 outline-white ${
              isSelected ? 'outline' : ''
            }`}
            src={memoizedSrc}
          />
        )}
      </div>
    </div>
  );
};

export default memo(ServerIcon);
