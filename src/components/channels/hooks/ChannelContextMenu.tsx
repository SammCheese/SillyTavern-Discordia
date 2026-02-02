import { useCallback, useMemo } from 'react';
import { useContextMenu } from '../../../providers/contextMenuProvider';
import { DISCORDIA_EVENTS } from '../../../events/eventTypes';
import type { ContextMenuItem } from '../../common/ContextMenuEntry/ContextMenuEntry';
import { usePopup } from '../../../providers/popupProvider';

const {
  deleteCharacterChatByName,
  eventSource,
  closeCurrentChat,
  openCharacterChat,
} = await imports('@script');
const { deleteGroupChatByName, openGroupChat } = await imports(
  '@scripts/groupChats',
);

export const useChannelContextMenu = (chat: Chat) => {
  const { showContextMenu } = useContextMenu();
  const { openPopup } = usePopup();

  const performDelete = useCallback(async () => {
    const { characters, characterId, groupId } = SillyTavern.getContext();

    if (!chat) return;
    try {
      if (groupId !== null && !characterId) {
        await closeCurrentChat();

        // fucking name inconsistencies
        await deleteGroupChatByName(groupId, chat.file_name);
      } else {
        let charId = chat.char_id ?? characterId;
        if (!charId) {
          charId = characters.findIndex((c) => c.avatar === chat.avatar);
        }
        if (charId === undefined || charId === -1) return;

        await closeCurrentChat();
        await deleteCharacterChatByName(charId.toString(), chat.file_id);
      }
    } catch (error) {
      dislog.error('Error deleting chat:', error);
    } finally {
      eventSource.emit(DISCORDIA_EVENTS.HOME_BUTTON_CLICKED);
    }
  }, [chat]);

  const openChat = useCallback(async () => {
    if (!chat) return;

    // Handle Recent Chats
    if (chat?.char_id) {
      await openCharacterChat(chat.char_id);
    } else {
      const { groupId, characterId } = SillyTavern.getContext();
      if (groupId !== null && !characterId) {
        await openGroupChat(groupId, chat?.file_name);
      } else {
        await openCharacterChat(chat?.file_id);
      }
    }
  }, [chat]);

  const handleDelete = useCallback(() => {
    openPopup(null, {
      title: 'Confirm Deletion',
      confirmText: 'Delete',
      confirmVariant: 'danger',
      cancelText: 'Cancel',
      description: `Are you sure you want to delete the chat "${chat.file_name}"? This action cannot be undone.`,
      onConfirm: async () => {
        await performDelete();
      },
    });
  }, [chat, openPopup, performDelete]);

  const menuOptions = useMemo(() => {
    return [
      {
        label: 'Open',
        onClick: openChat,
      },
      /*{
        label: 'Export',
        onClick: () => {
          console.log('Export channel:', chat.file_id);
        },
      },*/
      {
        label: '---',
        variant: 'separator',
      },
      {
        label: 'Delete',
        variant: 'danger',
        onClick: handleDelete,
      },
    ] as ContextMenuItem[];
  }, [handleDelete, openChat]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      showContextMenu(e, menuOptions);
    },
    [menuOptions, showContextMenu],
  );

  return { handleContextMenu };
};
