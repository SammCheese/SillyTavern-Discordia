import { useCallback, useMemo } from 'react';
import { useContextMenu } from '../../../providers/contextMenuProvider';
import { DISCORDIA_EVENTS } from '../../../events/eventTypes';
import type { ContextMenuItem } from '../../common/ContextMenuEntry/ContextMenuEntry';
import { usePopup } from '../../../providers/popupProvider';
import RenamePopup from '../components/RenamePopup';

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
      // If the chat is a group chat
      if (groupId !== null && !characterId) {
        await closeCurrentChat();

        // Delete the groupchat and go back to the last opened chat
        await deleteGroupChatByName(groupId, chat.file_id);
        // If the chat is a character chat
      } else {
        let charId = chat.char_id ?? characterId;
        if (!charId) {
          charId = characters.findIndex((c) => c.avatar === chat.avatar);
        }
        if (charId === undefined || charId === -1) return;
        await closeCurrentChat();

        await deleteCharacterChatByName(
          charId.toString(),
          chat.file_name.replace('.jsonl', ''),
        );
      }
    } catch (error) {
      dislog.error('Error deleting chat:', error);
    } finally {
      eventSource.emit(DISCORDIA_EVENTS.RECENTS_REFRESH);
    }
  }, [chat]);

  const openChat = useCallback(() => {
    if (!chat) return;

    const openAction = () => {
      // If the chat is a character chat
      if (chat?.char_id) {
        return openCharacterChat(chat.file_id);
      }

      const { groupId, characterId } = SillyTavern.getContext();
      if (groupId !== null && !characterId) {
        return openGroupChat(groupId, chat?.file_id);
      }

      return openCharacterChat(chat?.file_id);
    };

    void Promise.resolve(openAction()).catch((error) => {
      dislog.error('Error opening chat:', error);
    });
  }, [chat]);

  const handleDelete = useCallback(() => {
    openPopup(null, {
      title: 'Confirm Deletion',
      confirmText: 'Delete',
      confirmVariant: 'danger',
      cancelText: 'Cancel',
      description: `Are you sure you want to delete the chat "${chat.file_id}"? This action cannot be undone.`,
      onConfirm: async () => {
        await performDelete();
      },
      onCancel: () => void 0,
    });
  }, [chat, openPopup, performDelete]);

  const handleRename = useCallback(() => {
    openPopup(
      <RenamePopup
        currentName={chat.file_name.replace('.jsonl', '')}
        charId={chat.char_id}
        groupChatId={chat.group}
      />,
      {
        title: 'Rename Chat',
      },
    );
  }, [chat, openPopup]);

  const menuOptions = useMemo(() => {
    return [
      {
        label: 'Open',
        onClick: openChat,
      },
      {
        label: '---',
        variant: 'separator',
      },
      /*{
        label: 'Export',
        onClick: () => {
          console.log('Export channel:', chat.file_id);
        },
      },*/
      {
        label: 'Rename',
        onClick: handleRename,
      },
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
  }, [handleDelete, handleRename, openChat]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      showContextMenu(e, menuOptions);
    },
    [menuOptions, showContextMenu],
  );

  return { handleContextMenu };
};
