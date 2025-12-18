import { memo, useMemo } from 'react';

interface MemberCardProps {
  member: Character;
  onRemove?: (member: Character) => void;
  onOpenProfile?: (member: Character) => void;
  onOrderChange?: (member: Character, direction: 'up' | 'down') => void;
}

const { getThumbnailUrl } = await imports('@script');

const MemberCard = ({
  member,
  onRemove,
  onOpenProfile,
  onOrderChange,
}: MemberCardProps) => {
  const imgSrc = useMemo(() => {
    return getThumbnailUrl('avatar', member.avatar || 'user-default.png');
  }, [member]);

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(member);
    }
  };

  const handleOpenProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenProfile) {
      onOpenProfile(member);
    }
  };

  const handleMoveUpClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOrderChange) {
      onOrderChange(member, 'up');
    }
  };

  const handleMoveDownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOrderChange) {
      onOrderChange(member, 'down');
    }
  };

  return (
    <div className="flex flex-row items-center gap-4 p-2 border rounded-md">
      <div className="w-10 h-10">
        <img
          loading="lazy"
          src={imgSrc}
          alt={member.name || 'Member Avatar'}
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="flex flex-col">
        <span className="font-medium">{member.name || 'Unnamed Member'}</span>
        <span className="text-sm text-gray-500">
          Tags: {member.tags.join(', ') || 'None'}
        </span>
      </div>

      <div className="ml-auto flex flex-row gap-2 items-center">
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
      </div>
    </div>
  );
};

interface MemberListProps {
  members?: Character[];
  onOrderChange: (member: Character, direction: 'up' | 'down') => void;
  onRemoveMember: (member: Character) => void;
  onOpenMemberProfile: (member: Character) => void;
}

const MemberList = ({
  members,
  onOrderChange,
  onRemoveMember,
  onOpenMemberProfile,
}: MemberListProps) => {
  return (
    <>
      <div className="flex flex-col gap-2">
        {members &&
          members.map((member, index) => (
            <MemberCard
              key={member.avatar || index}
              member={member}
              onOrderChange={onOrderChange}
              onRemove={onRemoveMember}
              onOpenProfile={onOpenMemberProfile}
            />
          ))}
      </div>
    </>
  );
};

export default memo(MemberList);
