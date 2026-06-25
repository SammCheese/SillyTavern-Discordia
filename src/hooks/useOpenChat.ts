import { useCallback, useRef, useState } from 'react';

import { selectCharacter, selectGroup } from '../utils/utils';

const { openCharacterChat, isGenerating } = await imports('@script');
const { openGroupChat } = await imports('@scripts/groupChats');

export function useOpenChat() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const latestOpenRequestRef = useRef(0);

  const isSelectedChat = useCallback((chat: Chat): boolean => {
    try {
      const name = chat.file_id;
      return SillyTavern.getContext().chatId === name;
    } catch {
      return false;
    }
  }, []);

  const refreshCurrentChatId = useCallback(() => {
    const chatId = SillyTavern.getContext().chatId ?? null;
    setCurrentChatId(chatId);
  }, []);

  const isCurrentlyGenerating = useCallback((): boolean => {
    return isGenerating();
  }, []);

  const isGroup = useCallback((): boolean => {
    const { groupId } = SillyTavern.getContext();
    return groupId !== null;
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

  const runOptimisticOpen = useCallback(
    (chatId: string | null, openAction: () => unknown) => {
      const previousChatId = SillyTavern.getContext().chatId ?? null;
      const requestId = ++latestOpenRequestRef.current;

      setCurrentChatId(chatId);

      void Promise.resolve(openAction()).catch((error) => {
        dislog.error('Failed to open chat:', error);

        if (latestOpenRequestRef.current === requestId) {
          setCurrentChatId(previousChatId);
        }
      });
    },
    [],
  );

  const openChat = useCallback(
    (chat: Chat): void => {
      if (!chat) return;

      // Safety, opening a chat may corrupt chat otherwise.
      if (isCurrentlyGenerating()) {
        toastr.warning(
          'Please wait or abort the current generation before switching chats.',
        );
        return;
      }

      if (isSelectedChat(chat)) return;

      const targetChatId = chat.file_id ?? null;

      const entityOpen = isEntityOpen();

      // Entity already open
      if (entityOpen) {
        if (isGroup()) {
          const { groupId } = SillyTavern.getContext();
          runOptimisticOpen(targetChatId, () =>
            openGroupChat(groupId!, chat.file_id),
          );
        } else if (!isGroup()) {
          runOptimisticOpen(targetChatId, () =>
            openCharacterChat(chat.file_id),
          );
        }
        return;
      }

      // Recent chats
      if (!entityOpen) {
        if (chat.is_group) {
          // Selecting a group with a specific chat
          runOptimisticOpen(targetChatId, () =>
            selectGroup({
              id: chat.group,
              chat_name: chat.file_id,
            }),
          );
        } else {
          const charId = chat.char_id;
          if (typeof charId !== 'number') return;
          const charIndex = SillyTavern.getContext().characters.findIndex(
            (c) => c.avatar === chat.avatar,
          );
          // Selecting a character with a specific chat
          runOptimisticOpen(
            targetChatId,
            () =>
              !isCurrentlyGenerating() &&
              selectCharacter(charIndex, chat.file_id),
          );
        }
        return;
      }
    },
    [
      isCurrentlyGenerating,
      isSelectedChat,
      isEntityOpen,
      isGroup,
      runOptimisticOpen,
    ],
  );

  return {
    openChat,
    isSelectedChat,
    currentChatId,
    setCurrentChatId,
    refreshCurrentChatId,
  } as const;
}
