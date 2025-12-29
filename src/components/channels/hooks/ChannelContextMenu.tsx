import { useCallback, useContext, useMemo } from 'react';
import { ContextMenuContext } from '../../../providers/contextMenuProvider';
import { DISCORDIA_EVENTS } from '../../../events/eventTypes';
import type { ContextMenuItem } from '../../common/ContextMenuEntry/ContextMenuEntry';
import { PopupContext } from '../../../providers/popupProvider';

const { deleteCharacterChatByName, eventSource, closeCurrentChat } =
  await imports('@script');
const { deleteGroupChatByName } = await imports('@scripts/groupChats');

export const useChannelContextMenu = (chat: Chat) => {
  const { showContextMenu } = useContext(ContextMenuContext);
  const { openPopup } = useContext(PopupContext);

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
      console.error('Error deleting chat:', error);
    } finally {
      eventSource.emit(DISCORDIA_EVENTS.HOME_BUTTON_CLICKED);
    }
  }, [chat]);

  const handleDelete = useCallback(() => {
    openPopup(null, {
      title: 'Confirm Deletion',
      confirmText: 'Delete',
      confirmVariant: 'danger',
      cancelText: 'Cancel',
      description: `Are you sure you want to delete the chat "${chat.file_name}"? This action cannot be undone.`,
      onCancel: () => {
        void 0;
      },
      onConfirm: async () => {
        await performDelete();
      },
    });
  }, [chat, openPopup, performDelete]);

  const menuOptions = useMemo(() => {
    return [
      {
        label: 'Open',
        onClick: () => {
          console.log('Open channel:', chat.file_id);
        },
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
  }, [chat, handleDelete]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      showContextMenu(e, menuOptions);
    },
    [menuOptions, showContextMenu],
  );

  return { handleContextMenu };
};
