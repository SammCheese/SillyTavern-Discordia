import { useCallback } from 'react';

import { selectCharacter, selectGroup } from '../utils/utils';

const { openCharacterChat, isGenerating } = await imports('@script');
const { openGroupChat } = await imports('@scripts/groupChats');

export function useOpenChat() {
  const isSelectedChat = useCallback((chat: Chat): boolean => {
    try {
      // file_id is used for character chats, file_name for group chats
      const name = chat.file_id ?? chat.file_name;
      return SillyTavern.getContext().chatId === name;
    } catch {
      return false;
    }
  }, []);

  const isCurrentlyGenerating = useCallback((): boolean => {
    return isGenerating();
  }, []);

  const isEntityOpen = useCallback((id?: string | number): boolean => {
    const { characterId, groupId } = SillyTavern.getContext();
    if (typeof characterId === 'undefined' && groupId === null) return false;

    if (typeof characterId !== 'undefined' && id) {
      return characterId == id;
    } else if (groupId !== null && id) {
      return groupId == id;
    }

    if (typeof characterId !== 'undefined' || groupId !== null) {
      return true;
    }

    return false;
  }, []);

  const openChat = useCallback(
    async (chat: Chat): Promise<void> => {
      if (!chat) return;

      // Safety, opening a chat may corrupt chat otherwise.
      if (isCurrentlyGenerating()) {
        toastr.warning(
          'Please wait or abort the current generation before switching chats.',
        );
        return;
      }

      if (isSelectedChat(chat)) return;

      const entityOpen = isEntityOpen();

      // Entity already open
      if (entityOpen) {
        const isGroup = chat?.file_id === undefined;
        if (isGroup) {
          const { groupId } = SillyTavern.getContext();
          await openGroupChat(groupId!, chat.file_name);
        } else if (!isGroup) {
          await openCharacterChat(chat.file_id);
        }
        return;
      }

      // Recent chats
      if (!entityOpen) {
        if (chat.is_group) {
          // Selecting a group with a specific chat
          await selectGroup({
            id: chat.group,
            chat_id: chat.file_name,
          });
        } else if (chat?.char_id !== undefined) {
          // Selecting a character with a specific chat
          await selectCharacter(chat.char_id, chat.file_id);
        }
        return;
      }
    },
    [isCurrentlyGenerating, isSelectedChat, isEntityOpen],
  );

  return { openChat, isSelectedChat } as const;
}
