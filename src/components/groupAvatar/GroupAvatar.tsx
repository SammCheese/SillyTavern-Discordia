import { useMemo, memo } from 'react';

import './GroupAvatar.css';

import {
  getThumbnailUrl,
  characters,
  default_avatar,
  eventSource,
  event_types,
} from '../../st/script';
import { isValidUrl } from '../../st/utils';
// One thumbnail map shared by all GroupAvatar instances. ST mutates the
// `characters` array in place, so we invalidate on character events and
// whenever the list length changes.
let thumbnailCache: Map<string, string> | null = null;
let thumbnailCacheLength = -1;

const invalidateThumbnailCache = () => {
  thumbnailCache = null;
};

eventSource.on(event_types.CHARACTER_EDITED, invalidateThumbnailCache);
eventSource.on(event_types.CHARACTER_RENAMED, invalidateThumbnailCache);
eventSource.on(event_types.CHARACTER_DELETED, invalidateThumbnailCache);

const getCharacterThumbMap = (): Map<string, string> => {
  if (!thumbnailCache || thumbnailCacheLength !== characters.length) {
    const map = new Map<string, string>();
    characters.forEach((c) => {
      if (c.avatar && c.avatar !== 'none') {
        map.set(c.avatar, getThumbnailUrl('avatar', c.avatar));
      }
    });
    thumbnailCache = map;
    thumbnailCacheLength = characters.length;
  }
  return thumbnailCache;
};

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
  const characterThumbByAvatar = getCharacterThumbMap();

  const roundedStyle = useMemo(
    () =>
      typeof rounded === 'number'
        ? `${rounded}px`
        : rounded
          ? '50%'
          : undefined,
    [rounded],
  );

  const groupItemMemo = useMemo(() => {
    if (groupItem) return groupItem;
    if (groupId) {
      return SillyTavern.getContext().groups.find(
        (g) => g.id.toString() === groupId.toString(),
      );
    }
    return undefined;
  }, [groupItem, groupId]);

  const avatarElements = useMemo(() => {
    if (!groupItem && !groupId) return <img src={default_avatar} />;

    if (isValidUrl(groupItemMemo?.avatar_url)) {
      return (
        <div className="avatar" title={`[Group] ${groupItemMemo?.name}`}>
          <img loading="lazy" src={groupItemMemo?.avatar_url} />
        </div>
      );
    }

    const memberAvatars: string[] = [];
    if (Array.isArray(groupItemMemo?.members)) {
      for (const member of groupItemMemo?.members ?? []) {
        const thumb = characterThumbByAvatar.get(member);
        if (thumb) memberAvatars.push(thumb);
        if (memberAvatars.length > 4) break;
      }
    }

    const count = memberAvatars.length;
    if (count < 1) return <img src={default_avatar} />;

    return (
      <div
        className={`collage_${count} flex flex-wrap ${rounded === 100 ? 'full' : ''}`}
        title={`[Group] ${groupItemMemo?.name}`}
        style={{
          width,
          height,
          borderRadius: roundedStyle,
        }}
      >
        {memberAvatars.map((src, i) => (
          <img key={src} className={`img_${i + 1} object-cover`} src={src} />
        ))}
      </div>
    );
  }, [
    groupItem,
    groupId,
    groupItemMemo?.avatar_url,
    groupItemMemo?.members,
    groupItemMemo?.name,
    rounded,
    width,
    height,
    roundedStyle,
    characterThumbByAvatar,
  ]);

  return <>{avatarElements}</>;
};

export default memo(GroupAvatar);
