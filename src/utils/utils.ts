const {
  getThumbnailUrl,
  system_avatar,
  openCharacterChat,
  setActiveCharacter,
  setActiveGroup,
  getCurrentChatId,
  saveSettingsDebounced,
  selectCharacterById,
} = await imports('@script');
const { openGroupById, openGroupChat } = await imports('@scripts/groupChats');
const { isDataURL } = await imports('@scripts/utils');

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
    dislog.debug(
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
    dislog.error('Error selecting character:', error);
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
    dislog.error('Error selecting group:', error);
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

export const runTaskInIdle = <T>(
  taskGenerator: Generator<T | null, void, unknown>,
  signal?: AbortSignal,
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const results: T[] = [];

    const processBatch = (deadline: IdleDeadline) => {
      if (signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }

      while (deadline.timeRemaining() > 1 || deadline.didTimeout) {
        const next = taskGenerator.next();

        if (next.done) {
          resolve(results);
          return;
        }

        if (next.value !== null) {
          results.push(next.value);
        }

        if (next.value === null && deadline.timeRemaining() <= 1) {
          break;
        }
      }

      if (!signal?.aborted) {
        requestIdleCallback(processBatch);
      }
    };

    requestIdleCallback(processBatch);
  });
};
