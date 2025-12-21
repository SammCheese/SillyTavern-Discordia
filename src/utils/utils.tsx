/* eslint-disable @typescript-eslint/no-explicit-any */

const {
  characters,
  getRequestHeaders,
  getThumbnailUrl,
  system_avatar,
  openCharacterChat,
  setActiveCharacter,
  setActiveGroup,
  getCurrentChatId,
  saveSettingsDebounced,
  selectCharacterById,
} = await imports('@script');
const { groups, openGroupById, openGroupChat } = await imports(
  '@scripts/groupChats',
);
const { sortMoments, timestampToMoment, isDataURL } =
  await imports('@scripts/utils');

export async function getRecentChats(entities?: Entity[], amount = 20) {
  const response = await fetch('/api/chats/recent', {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({ max: amount }),
  });

  if (!response.ok) {
    console.warn('Failed to fetch recent character chats');
    return [];
  }

  const data: any[] = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const dataWithEntities = data
    .sort((a, b) =>
      sortMoments(timestampToMoment(a.last_mes), timestampToMoment(b.last_mes)),
    )
    .map((chat) => ({
      chat,
      character: characters.find((x) => x.avatar === chat.avatar),
      group: groups.find((x) => x.id === chat.group),
    }))
    .filter((t) => t.character || t.group)
    .filter((t) => {
      if (!entities || entities.length === 0) return true;

      const chatEntity = entities.find(
        (e) =>
          (t.character &&
            e.type === 'character' &&
            e.item.avatar.toString() === t.character!.avatar?.toString()) ||
          (t.group &&
            e.type === 'group' &&
            e.id.toString() === t.group!.id.toString()),
      );
      return !!chatEntity;
    });

  dataWithEntities.forEach(({ chat, character, group }, index) => {
    const chatTimestamp = timestampToMoment(chat.last_mes);
    chat.char_name = character?.name || group?.name || '';
    chat.date_short = chatTimestamp.format('l');
    chat.date_long = chatTimestamp.format('LL LT');
    chat.chat_name = chat.file_name.replace('.jsonl', '');
    chat.char_thumbnail = character
      ? getThumbnailUrl('avatar', character?.avatar ?? '')
      : system_avatar;
    chat.is_group = !!group;
    chat.hidden = index >= 15;
    chat.avatar = chat.avatar || '';
    chat.group = chat.group || '';
    chat.char_id = character ? characters.indexOf(character) : undefined;
  });

  return dataWithEntities.map((t) => t.chat);
}

export async function resetScrollHeight(element) {
  $(element).css('height', '0px');
  $(element).css('height', $(element).prop('scrollHeight') + 3 + 'px');
}

export function toggleDrawer(drawer, expand = true) {
  /** @type {HTMLElement} */
  const icon = drawer.querySelector(
    ':scope > .inline-drawer-header .inline-drawer-icon',
  );
  /** @type {HTMLElement} */
  const content = drawer.querySelector(':scope > .inline-drawer-content');

  if (!icon || !content) {
    console.debug(
      'toggleDrawer: No icon or content found in the drawer element.',
    );
    return;
  }

  if (expand) {
    icon.classList.remove('down', 'fa-circle-chevron-down');
    icon.classList.add('up', 'fa-circle-chevron-up');
    content.style.display = 'block';
  } else {
    icon.classList.remove('up', 'fa-circle-chevron-up');
    icon.classList.add('down', 'fa-circle-chevron-down');
    content.style.display = 'none';
  }

  drawer.dispatchEvent(
    new CustomEvent('inline-drawer-toggle', { bubbles: true }),
  );

  // Set the height of "autoSetHeight" textareas within the inline-drawer to their scroll height
  if (!CSS.supports('field-sizing', 'content')) {
    content
      .querySelectorAll('textarea.autoSetHeight')
      .forEach(resetScrollHeight);
  }
}

export function isValidImageUrl(url) {
  // check if empty dict
  if (Object.keys(url).length === 0) {
    return false;
  }
  return (
    isDataURL(url) ||
    (url && (url.startsWith('user') || url.startsWith('/user')))
  );
}

export const selectCharacter = async (char_id: number, chat_id?: string) => {
  try {
    await selectCharacterById(char_id);
    setActiveCharacter(char_id);
    saveSettingsDebounced();
    if (getCurrentChatId() === chat_id || !chat_id) return;

    await openCharacterChat(chat_id);
  } catch (error) {
    console.error('Error selecting character:', error);
  }
};

export const selectGroup = async ({
  group,
  chat_id,
  id,
}: {
  group?: Entity;
  chat_id?: string | undefined;
  id?: string | null | undefined;
}) => {
  try {
    if (!group && !id) return;

    const groupId = id || group?.id.toString() || '';

    if (!groupId) return;

    await openGroupById(groupId);
    setActiveGroup(groupId);
    saveSettingsDebounced();
    if (!chat_id || getCurrentChatId() === chat_id) return;

    await openGroupChat(groupId, chat_id);
  } catch (error) {
    console.error('Error selecting group:', error);
  }
};

export const makeAvatar = ({
  chat,
  charId,
  groupId,
}: {
  chat?: Chat;
  charId?: number | string;
  groupId?: number | string | null;
}): string => {
  if (chat && chat?.avatar) {
    return getThumbnailUrl('avatar', chat?.avatar);
  }

  if (!charId && !groupId) {
    charId = SillyTavern.getContext().characterId;
    groupId = SillyTavern.getContext().groupId;
  }

  if (groupId !== null && typeof groupId !== 'undefined') {
    const group = SillyTavern.getContext().groups.find(
      (g) => g.id.toString() === groupId.toString(),
    );
    return group.avatar_url;
  }

  const charIdNum =
    typeof charId === 'string' ? parseInt(charId) : (charId ?? -1);
  const character = SillyTavern.getContext().characters[charIdNum];

  if (!character) return system_avatar;

  return getThumbnailUrl('avatar', character.avatar || '');
};
