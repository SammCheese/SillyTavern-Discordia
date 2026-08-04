import { useCallback, useMemo } from 'react';
import { useContextMenu } from '../../../providers/contextMenuProvider';
import type { ContextMenuItem } from '../../common/ContextMenuEntry/ContextMenuEntry';
import { usePopup } from '../../../providers/popupProvider';
import RenamePopup from '../components/RenamePopup';
import { DISCORDIA_EVENTS } from '../../../events/eventTypes';

import {
  deleteCharacterChatByName,
  event_types,
  eventSource,
  openCharacterChat,
  clearChat,
} from '../../../st/script';
import { deleteGroupChatByName, openGroupChat } from '../../../st/groupChats';
import { selectCharacter, selectGroup } from '../../../utils/utils';

export const useChannelContextMenu = (chat: Chat) => {
  const { showContextMenu } = useContextMenu();
  const { openPopup } = usePopup();

  const performDelete = useCallback(async () => {
    const { groups, characterId, groupId, chatId } = SillyTavern.getContext();

    if (!chat) return;

    let charId =
      typeof chat.char_id !== 'undefined' ? chat.char_id.toString() : undefined;
    let groupsId = chat.group
      ? groups.find((g) => g.id == chat.group)?.id.toString()
      : undefined;
    let wasRecents = true;

    // We likely have the character selected
    if (!charId && !groupsId) {
      charId =
        typeof characterId !== 'undefined' ? characterId.toString() : undefined;
      groupsId = groupId !== null ? groupId.toString() : undefined;
      wasRecents = false;
    }

    if (!charId && !groupsId) {
      dislog.warn('No character or group found for chat deletion');
      return;
    }

    try {
      // If the chat is a group chat
      if (groupsId) {
        await deleteGroupChatByName(groupsId, chat.file_id);
        // If the chat is a character chat
      } else if (charId) {
        await deleteCharacterChatByName(charId, chat.file_id);
      }

      if (chatId === chat.file_id) {
        await clearChat({ clearData: true });
      }

      await eventSource.emit(event_types.CHAT_DELETED, chat.file_id);
      if (wasRecents) {
        await eventSource.emit(DISCORDIA_EVENTS.RECENTS_REFRESH);
      }
    } catch (error) {
      dislog.error('Error deleting chat:', error);
    }
  }, [chat]);

  const openChat = useCallback(() => {
    if (!chat) return;

    const openAction = () => {
      const { groupId, characterId, characters } = SillyTavern.getContext();

      // Group chat from the recents list
      if (chat.group) {
        return selectGroup({
          id: chat.group.toString(),
          chat_name: chat.file_id,
        });
      }

      // Chat list of the currently open group
      if (groupId !== null && typeof characterId === 'undefined') {
        return openGroupChat(groupId, chat.file_id);
      }

      // Character chat: select the character first (recents may be clicked
      // with no or another character open; char_id 0 is a valid id)
      const charIndex = characters.findIndex((c) => c.avatar === chat.avatar);
      if (charIndex !== -1) {
        return selectCharacter(charIndex, chat.file_id);
      }

      return openCharacterChat(chat.file_id);
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
        currentName={chat.file_id}
        charChatId={chat.char_id}
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
