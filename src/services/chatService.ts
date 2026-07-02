import {
  characters,
  getRequestHeaders,
  getThumbnailUrl,
  system_avatar,
  updateRemoteChatName,
  eventSource,
  event_types,
  reloadCurrentChat,
} from '../st/script';
import { groups, renameGroupChat } from '../st/groupChats';
import {
  sortMoments,
  timestampToMoment,
  equalsIgnoreCaseAndAccents,
} from '../st/utils';

let cachedCharacterMap: Map<string, Character> | null = null;
let cachedGroupMap: Map<string, GroupItem> | null = null;

export const invalidateEntityCache = () => {
  cachedCharacterMap = null;
  cachedGroupMap = null;
};

const getCharacterMap = () => {
  if (!cachedCharacterMap) {
    cachedCharacterMap = new Map(characters.map((c) => [c.avatar!, c]));
  }
  return cachedCharacterMap;
};

const getGroupMap = () => {
  if (!cachedGroupMap) {
    cachedGroupMap = new Map(groups.map((g) => [g.id.toString(), g]));
  }
  return cachedGroupMap;
};

export async function getRecentChats(entities?: Entity[], amount = 20) {
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

  // Use cached maps for performance
  const charactersByAvatar = getCharacterMap();
  const groupsById = getGroupMap();

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
    .reduce((result, chat, index) => {
      const character = chat.avatar
        ? charactersByAvatar.get(chat.avatar)
        : undefined;
      const group = chat.group ? groupsById.get(String(chat.group)) : undefined;

      if (hasEntityFilter && !character && !group) return result;

      if (hasEntityFilter) {
        const hasMatchingEntity =
          (character && validEntityKeys.has(`char:${character.avatar}`)) ||
          (group && validEntityKeys.has(`group:${group.id}`));
        if (!hasMatchingEntity) return result;
      }

      const chatTimestamp = timestampToMoment(chat.last_mes);
      result.push({
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
      });

      return result;
    }, []);

  return dataWithEntities;
}

/**
 * Renames a group or character chat.
 * @param {object} param Parameters for renaming chat
 * @param {string} [param.characterId] Character ID to rename chat for
 * @param {string} [param.groupId] Group ID to rename chat for
 * @param {string} param.oldFileName Old name of the chat (no JSONL extension)
 * @param {string} param.newFileName New name for the chat (no JSONL extension)
 */
export async function renameGroupOrCharacterChatFixed({
  characterId,
  groupId,
  oldFileName,
  newFileName,
}) {
  const { characters, chatId } = SillyTavern.getContext();
  const body = {
    is_group: !!groupId,
    avatar_url: characters[characterId]?.avatar,
    original_file: `${oldFileName}.jsonl`,
    renamed_file: `${newFileName.trim()}.jsonl`,
  };

  if (body.original_file === body.renamed_file) {
    console.debug('Chat rename cancelled, old and new names are the same');
    return;
  }
  if (equalsIgnoreCaseAndAccents(body.original_file, body.renamed_file)) {
    toastr.warning(
      `Name not accepted, as it is the same as before (ignoring case and accents).`,
      `Rename Chat`,
    );
    return;
  }

  try {
    const response = await fetch('/api/chats/rename', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: getRequestHeaders(),
    });

    if (!response.ok) {
      throw new Error('Unsuccessful request.');
    }

    const data = await response.json();

    if (data.error) {
      throw new Error('Server returned an error.');
    }

    if (data.sanitizedFileName) {
      newFileName = data.sanitizedFileName;
    }

    if (groupId) {
      await renameGroupChat(groupId, oldFileName, newFileName);
    } else if (characterId) {
      await updateRemoteChatName(characterId, newFileName);
    }

    if (chatId === oldFileName) {
      await reloadCurrentChat();
    }

    const eventData = {
      avatarId: body.avatar_url,
      groupId,
      oldFileName: body.original_file,
      newFileName: body.renamed_file,
    };
    await eventSource.emit(event_types.CHAT_RENAMED, eventData);
  } catch {
    toastr.error(`Failed to rename chat. Please try again.`, `Rename Chat`);
    throw new Error(
      `Failed to rename chat from ${oldFileName} to ${newFileName}`,
    );
  }
}
