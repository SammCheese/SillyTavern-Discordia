import React from 'react';
import { makeReactGroupAvatar } from '../../utils/utils';

const { getThumbnailUrl } = await imports('@script');

const ServerIcon = ({
  entity,
  isSelected,
  onSelect,
}: {
  entity: Entity;
  isSelected: boolean;
  onSelect?: (id: string) => void;
}) => {
  const [hovered, setHovered] = React.useState(false);

  // Precaution
  React.useEffect(() => {
    let hoverTimeout: NodeJS.Timeout;
    if (hovered) {
      hoverTimeout = setTimeout(() => {
        setHovered(false);
      }, 3000);
    }
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hovered]);

  // Memoize group avatar to avoid unnecessary re-renders
  const memoizedGroupAvatar = React.useMemo(() => {
    if (entity.type === 'group') {
      return makeReactGroupAvatar(entity.item);
    }
    return null;
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
        className="cursor-pointer w-full h-fit flex justify-center items-center"
      >
        {entity.type === 'group' ? (
          <>{memoizedGroupAvatar}</>
        ) : (
          <img
            className={`rounded-xl h-12 w-12 object-cover hover:outline-1 outline-white ${
              isSelected ? 'outline' : ''
            }`}
            src={getThumbnailUrl('avatar', entity.item?.avatar || entity.id)}
            onClick={() => onSelect && onSelect(entity.id.toString())}
          />
        )}
      </div>
    </div>
  );
};

const MemoizedServerIcon = React.memo(ServerIcon);

export default MemoizedServerIcon;
