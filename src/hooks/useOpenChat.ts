import { useCallback } from 'react';

import { selectCharacter, selectGroup } from '../utils/utils';
import { DISCORDIA_EVENTS } from '../events/eventTypes';

const { closeCurrentChat, openCharacterChat } = await imports('@script');
const { openGroupChat } = await imports('@scripts/groupChats');
const { eventSource } = await imports('@script');

export function useOpenChat() {
  const isSelectedChat = useCallback((chat: Chat): boolean => {
    try {
      const name = chat.file_id ?? chat.file_name;
      return SillyTavern.getContext().chatId === name;
    } catch {
      return false;
    }
  }, []);

  const openChat = useCallback(async (chat: Chat): Promise<void> => {
    if (!chat) return;

    if (isSelectedChat(chat)) return;

    // Recent Chat handler
    if ((chat?.char_id !== undefined && chat?.char_id >= 0) || chat?.is_group) {
      // Mark chat switch pending
      eventSource.emit(DISCORDIA_EVENTS.CHAT_SWITCH_PENDING);

      await closeCurrentChat();

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

    // Channel Switch within selected character/group
    const { characterId, groupId } = SillyTavern.getContext();
    if (groupId !== null) {
      await openGroupChat(groupId, chat.file_name);
    } else if (characterId) {
      await openCharacterChat(chat.file_id);
    }
  }, [isSelectedChat]);

  return { openChat, isSelectedChat } as const;
}
