const { characters, getRequestHeaders, getThumbnailUrl, system_avatar } =
  await imports('@script');
const { groups } = await imports('@scripts/groupChats');
const { sortMoments, timestampToMoment } = await imports('@scripts/utils');

export async function getRecentChats(entities?: Entity[], amount = 20) {
  dislog.log(entities, amount);
  const response = await fetch('/api/chats/recent', {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({ max: amount }),
  });

  if (!response.ok) {
    dislog.warn('Failed to fetch recent character chats');
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any[] = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const charactersByAvatar = new Map(characters.map((c) => [c.avatar, c]));
  const groupsById = new Map(groups.map((g) => [g.id.toString(), g]));

  const validEntityKeys = new Set<string>();

  if (entities && entities.length > 0) {
    entities.forEach((e) => {
      if (e.type === 'character') {
        validEntityKeys.add(`char:${e.item.avatar}`);
      } else if (e.type === 'group') {
        validEntityKeys.add(`group:${e.id.toString()}`);
      }
    });
  }

  const hasEntityFilter = validEntityKeys.size > 0;

  const dataWithEntities = data
    .sort((a, b) =>
      sortMoments(timestampToMoment(a.last_mes), timestampToMoment(b.last_mes)),
    )
    .map((chat, index) => {
      const character = chat.avatar
        ? charactersByAvatar.get(chat.avatar)
        : undefined;
      const group = chat.group ? groupsById.get(String(chat.group)) : undefined;

      if (hasEntityFilter && !character && !group) return null;

      if (hasEntityFilter) {
        const hasMatchingEntity =
          (character && validEntityKeys.has(`char:${character.avatar}`)) ||
          (group && validEntityKeys.has(`group:${group.id}`));
        if (!hasMatchingEntity) return null;
      }

      const chatTimestamp = timestampToMoment(chat.last_mes);
      return {
        ...chat,
        char_name: character?.name || group?.name || String(chat.group || ''),
        date_short: chatTimestamp.format('l'),
        date_long: chatTimestamp.format('LL LT'),
        chat_name: chat.file_name.replace('.jsonl', ''),
        char_thumbnail: character
          ? getThumbnailUrl('avatar', character.avatar ?? '')
          : system_avatar,
        is_group: Boolean(group || chat.group),
        hidden: index >= 15,
        char_id: character ? characters.indexOf(character) : undefined,
      };
    })
    .filter((chat) => chat !== null);

  return dataWithEntities;
}
