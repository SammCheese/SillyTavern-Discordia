import { useMemo, memo } from 'react';

// @ts-expect-error css file
import './GroupAvatar.css';

const { getThumbnailUrl, characters, default_avatar } =
  await imports('@script');
const { isValidUrl } = await imports('@scripts/utils');

interface GroupAvatarProps {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  groupItem?: any | undefined;
  groupId?: string | number | undefined;
  width?: number;
  height?: number;
  rounded?: boolean | number | undefined;
}

const GroupAvatar = ({
  groupItem,
  groupId,
  width = 48,
  height = 48,
  rounded = false,
}: GroupAvatarProps) => {
  const characterThumbByAvatar = useMemo(() => {
    const map = new Map<string, string>();
    characters.forEach((c) => {
      if (c.avatar && c.avatar !== 'none') {
        map.set(c.avatar, getThumbnailUrl('avatar', c.avatar));
      }
    });
    return map;
  }, [characters]);

  const avatarElements = useMemo(() => {
    if (!groupItem && !groupId) return <img src={default_avatar} />;

    if (!groupItem && groupId) {
      groupItem = SillyTavern.getContext().groups.find(
        (g) => g.id.toString() === groupId.toString(),
      );
    }

    if (isValidUrl(groupItem?.avatar_url)) {
      return (
        <div className="avatar" title={`[Group] ${groupItem.name}`}>
          <img loading="lazy" src={groupItem.avatar_url} />
        </div>
      );
    }

    const memberAvatars: string[] = [];
    if (Array.isArray(groupItem?.members)) {
      for (const member of groupItem.members) {
        const thumb = characterThumbByAvatar.get(member);
        if (thumb) memberAvatars.push(thumb);
        if (memberAvatars.length > 4) break;
      }
    }

    const count = memberAvatars.length;
    if (count < 1) return <img src={default_avatar} />;

    const roundedStyle = useMemo(
      () =>
        typeof rounded === 'number'
          ? `${rounded}px`
          : rounded
            ? '50%'
            : undefined,
      [rounded],
    );

    return (
      <div
        className={`collage_${count} flex flex-wrap ${rounded === 100 ? 'full' : ''}`}
        title={`[Group] ${groupItem?.name}`}
        style={{ width, height, borderRadius: roundedStyle }}
      >
        {memberAvatars.map((src, i) => (
          <img key={i} className={`img_${i + 1} object-cover`} src={src} />
        ))}
      </div>
    );
  }, [groupItem, width, height, rounded, characterThumbByAvatar]);

  return <>{avatarElements}</>;
};

export default memo(GroupAvatar);
