import { memo, useCallback, useMemo } from 'react';
import GroupAvatar from '../../groupAvatar/GroupAvatar';
import { useServerIconMenu } from '../hooks/ServerIconMenu';
import Tooltip from '../../common/Tooltip/Tooltip';

import { getThumbnailUrl } from '../../../st/script';
import { isFavoriteEntity } from '../services/entitySelection';

interface ServerIconProps {
  entity: Entity;
  isSelected: boolean;
  onClick?: (entity: Entity) => void;
}

const ServerIcon = ({ entity, isSelected, onClick }: ServerIconProps) => {
  const { handleContextMenu: contextMenuHandler } = useServerIconMenu(entity);

  const handleClick = useCallback(() => {
    onClick?.(entity);
  }, [onClick, entity]);

  const avatarId = entity.item?.avatar || entity.id;
  const memoizedSrc = useMemo(
    () => getThumbnailUrl('avatar', avatarId),
    [avatarId],
  );

  const isFavorite = isFavoriteEntity(entity);

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', String(entity.id));
    },
    [entity.id],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    //const draggedEntityId = e.dataTransfer.getData('text/plain');
  }, []);

  return (
    <Tooltip
      text={entity.item?.name || 'Character'}
      delay={200}
      direction="right"
      containerWidth="100%"
    >
      <div
        className="flex m-0 relative w-full h-fit select-none group"
        onContextMenu={contextMenuHandler}
        onClick={handleClick}
      >
        <div className="absolute insert-s-0 top-0 w-2 justify-start items-center flex h-full">
          <span
            className={`w-2 absolute block transition-[height] ease-in-out duration-200 -ms-1 bg-white rounded-r ${
              isSelected ? 'h-8' : 'h-0 group-hover:h-6'
            }`}
          />
        </div>

        <div
          className="cursor-pointer w-full h-fit flex justify-center items-center"
          draggable={true}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {entity.type === 'group' ? (
            <GroupAvatar groupItem={entity.item} rounded={true} />
          ) : (
            <img
              draggable={false}
              loading="lazy"
              alt={entity.item?.name || 'Character'}
              className={`rounded-xl h-12 w-12 object-cover ${
                isSelected
                  ? 'outline-1 outline-white'
                  : 'group-hover:outline-1 group-hover:outline-white'
              }`}
              style={{
                outlineColor: isFavorite ? 'yellow' : 'transparent',
                outlineWidth: isFavorite ? '2px' : '0px',
                outlineStyle: 'solid',
              }}
              src={memoizedSrc}
            />
          )}
        </div>
      </div>
    </Tooltip>
  );
};

export default memo(ServerIcon);
