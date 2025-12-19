import { memo } from 'react';
import MemberCard from './MemberCard';

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
              character={member}
              type="member"
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
