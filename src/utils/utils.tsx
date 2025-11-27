/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';

const {
  characters,
  getRequestHeaders,
  getThumbnailUrl,
  system_avatar,
  default_avatar,
  openCharacterChat,
  setActiveCharacter,
  setActiveGroup,
  getCurrentChatId,
  saveSettingsDebounced,
  selectCharacterById
} = await imports('@script');
const { groups, openGroupById, openGroupChat } = await imports('@scripts/groupChats');
const { sortMoments, timestampToMoment, isDataURL } = await imports(
  '@scripts/utils'
);


export async function getRecentChats() {
  const response = await fetch('/api/chats/recent', {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({ max: 15 }),
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
      sortMoments(timestampToMoment(a.last_mes), timestampToMoment(b.last_mes))
    )
    .map((chat) => ({
      chat,
      character: characters.find((x) => x.avatar === chat.avatar),
      group: groups.find((x) => x.id === chat.group),
    }))
    .filter((t) => t.character || t.group);

  dataWithEntities.forEach(({ chat, character, group }, index) => {
    const chatTimestamp = timestampToMoment(chat.last_mes);
    chat.char_name = character?.name || group?.name || '';
    chat.date_short = chatTimestamp.format('l');
    chat.date_long = chatTimestamp.format('LL LT');
    chat.chat_name = chat.file_name.replace('.jsonl', '');
    chat.char_thumbnail = character
      ? getThumbnailUrl('avatar', character.avatar)
      : system_avatar;
    chat.is_group = !!group;
    chat.hidden = index >= 10;
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
    ':scope > .inline-drawer-header .inline-drawer-icon'
  );
  /** @type {HTMLElement} */
  const content = drawer.querySelector(':scope > .inline-drawer-content');

  if (!icon || !content) {
    console.debug(
      'toggleDrawer: No icon or content found in the drawer element.'
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
    new CustomEvent('inline-drawer-toggle', { bubbles: true })
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

export function makeReactGroupAvatar(groupItem: any): React.ReactElement {
  if (!groupItem) {
    return <img src={default_avatar} />;
  }

  if (isValidImageUrl(groupItem.avatar_url)) {
    return (
      <div className="avatar" title={`[Group] ${groupItem.name}`}>
        <img src={groupItem.avatar_url} />
      </div>
    );
  }

  const memberAvatars: string[] = [];
  if (
    groupItem &&
    Array.isArray(groupItem.members) &&
    groupItem.members.length
  ) {
    for (const member of groupItem.members) {
      const charIndex = characters.findIndex((x) => x.avatar === member);
      if (charIndex !== -1 && characters[charIndex]?.avatar !== 'none') {
        const avatar = getThumbnailUrl(
          'avatar',
          characters[charIndex]?.avatar || default_avatar
        );
        memberAvatars.push(avatar);
      }
      if (memberAvatars.length === 4) {
        break;
      }
    }
  }

  const avatarCount = memberAvatars.length;

  if (avatarCount >= 1 && avatarCount <= 4) {
    const imgElements: React.ReactElement[] = [];

    for (let i = 0; i < avatarCount; i++) {
      const imgElement = React.createElement('img', {
        className: `img_${i + 1}`,
        src: memberAvatars[i],
      });
      imgElements.push(imgElement);
    }
    const groupAvatar = React.createElement(
      'div',
      {
        id: 'group_avatars_template',
        className: `collage_${avatarCount} group-avatar`,
        title: `[Group] ${groupItem.name}`,
      },
      ...imgElements
    );
    return groupAvatar;
  }

  // catch edge case where group had one member and that member is deleted
  if (avatarCount === 0) {
    return <div className="missing-avatar fa-solid fa-user-slash"></div>;
  }

  // default avatar
  const groupAvatar = React.createElement(
    'div',
    {
      id: 'group_avatars_template',
      className: `collage_1 group-avatar`,
      title: `[Group] ${groupItem.name}`,
    },
    React.createElement('img', { className: 'img_1', src: system_avatar })
  );
  return groupAvatar;
}


export const selectCharacter = async (char_id: number, chat_id?: string) => {
    try {
      await selectCharacterById(char_id);
      setActiveCharacter(char_id);
      saveSettingsDebounced();
      if (getCurrentChatId() === chat_id) return;

      await openCharacterChat(chat_id);
    } catch (error) {
      console.error('Error selecting character:', error);
    }
  };

export const selectGroup = async (group: Entity, chat_id?: string) => {
  try {
    const groupId = group.id.toString();
    await openGroupById(groupId);
    setActiveGroup(groupId);
    saveSettingsDebounced();
    if (!chat_id || getCurrentChatId() === chat_id) return;

    await openGroupChat(groupId, chat_id);
  } catch (error) {
    console.error('Error selecting group:', error);
  }
}
