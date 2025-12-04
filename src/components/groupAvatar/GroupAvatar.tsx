import React, { useMemo } from 'react';

const { getThumbnailUrl, characters, default_avatar } =
  await imports('@script');
const { isValidUrl } = await imports('@scripts/utils');

interface GroupAvatarProps {
  groupItem: any;
}

export const GroupAvatar = React.memo(({ groupItem }: GroupAvatarProps) => {
  const avatarElements = useMemo(() => {
    if (!groupItem) return <img src={default_avatar} />;

    if (isValidUrl(groupItem.avatar_url)) {
      return (
        <div className="avatar" title={`[Group] ${groupItem.name}`}>
          <img loading="lazy" src={groupItem.avatar_url} />
        </div>
      );
    }

    const memberAvatars: string[] = [];
    if (Array.isArray(groupItem?.members)) {
      for (const member of groupItem.members) {
        const charIndex = characters.findIndex((x) => x.avatar === member);
        if (charIndex !== -1 && characters[charIndex]?.avatar !== 'none') {
          memberAvatars.push(
            getThumbnailUrl(
              'avatar',
              characters[charIndex]?.avatar || default_avatar,
            ),
          );
        }
        if (memberAvatars.length === 4) break;
      }
    }

    const count = memberAvatars.length;
    if (count < 1) return <img src={default_avatar} />;

    return (
      <div
        id="group_avatars_template"
        className={`collage_${count} group-avatar`}
        title={`[Group] ${groupItem.name}`}
      >
        {memberAvatars.map((src, i) => (
          <img key={i} className={`img_${i + 1}`} src={src} />
        ))}
      </div>
    );
  }, [groupItem]);

  return <>{avatarElements}</>;
});
