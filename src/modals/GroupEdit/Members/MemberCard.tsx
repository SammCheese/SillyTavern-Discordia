import { memo, useCallback, useMemo } from 'react';

interface MemberCardProps {
  character: Character;
  onRemove?: (member: Character) => void;
  onOpenProfile?: (member: Character) => void;
  onOrderChange?: (member: Character, direction: 'up' | 'down') => void;
  onGroupAdd?: (member: Character) => void;
  type?: 'member' | 'character';
}

const { getThumbnailUrl } = await imports('@script');

export const MemberCard = ({
  character,
  onRemove,
  onOpenProfile,
  onOrderChange,
  onGroupAdd,
  type = 'character',
}: MemberCardProps) => {
  const imgSrc = useMemo(() => {
    return getThumbnailUrl(
      'avatar',
      character.avatar || 'default_Assistant.png',
    );
  }, [character]);

  const handleRemoveClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onRemove) {
        onRemove(character);
      }
    },
    [onRemove, character],
  );

  const handleOpenProfileClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onOpenProfile) {
        onOpenProfile(character);
      }
    },
    [onOpenProfile, character],
  );

  const handleMoveUpClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onOrderChange) {
        onOrderChange(character, 'up');
      }
    },
    [onOrderChange, character],
  );

  const handleMoveDownClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onOrderChange) {
        onOrderChange(character, 'down');
      }
    },
    [onOrderChange, character],
  );

  const handleGroupAddClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onGroupAdd) {
        onGroupAdd(character);
      }
    },
    [onGroupAdd, character],
  );

  const MemberButtons = useMemo(() => {
    return (
      <>
        <div className="flex flex-col gap-1 w-6 items-center">
          <div>
            <div
              title="Move Up"
              className="fa fa-solid fa-arrow-up cursor-pointer"
              onClick={handleMoveUpClick}
            />
          </div>
          <div>
            <div
              title="Move Down"
              className="fa fa-solid fa-arrow-down cursor-pointer"
              onClick={handleMoveDownClick}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 w-6 items-center">
          <div
            title="Open Character Card"
            className="fa fa-solid fa-user cursor-pointer"
            onClick={handleOpenProfileClick}
          />
        </div>

        <div className="flex flex-col gap-1 w-6 items-center">
          <div
            title="Remove Member"
            className="fa fa-solid fa-trash cursor-pointer text-red-500"
            onClick={handleRemoveClick}
          />
        </div>
      </>
    );
  }, [
    handleMoveUpClick,
    handleMoveDownClick,
    handleOpenProfileClick,
    handleRemoveClick,
  ]);

  const CharacterButtons = useMemo(() => {
    return (
      <>
        <div className="flex flex-col gap-1 w-6 items-center">
          <div
            title="Add to Group"
            className="fa fa-solid fa-plus cursor-pointer"
            onClick={handleGroupAddClick}
          />
        </div>
      </>
    );
  }, [handleGroupAddClick]);

  return (
    <div className="flex flex-row items-center gap-4 p-2 border rounded-md border-base-discordia-lighter hover:bg-lighter">
      <div className="w-10 h-10 min-w-10 min-h-10">
        <img
          loading="lazy"
          src={imgSrc}
          alt={character.name || 'Member Avatar'}
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="flex flex-col w-full min-w-0 overflow-hidden">
        <span className="font-medium">
          {character.name || 'Unnamed Member'}
        </span>
        <span className="text-sm text-gray-500 truncate">
          Tags: {character.tags.join(', ') || 'None'}
        </span>
      </div>

      <div className="ml-auto flex flex-row gap-2 items-center">
        {type === 'member' ? MemberButtons : CharacterButtons}
      </div>
    </div>
  );
};

export default memo(MemberCard);
