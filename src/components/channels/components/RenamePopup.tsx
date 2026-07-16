import { memo, useCallback, useState } from 'react';
import Input from '../../common/Input/Input';
import Button, { ButtonLook } from '../../common/Button/Button';
import { usePopup } from '../../../providers/popupProvider';
import { renameGroupOrCharacterChatFixed } from '../../../services/chatService';
import { DISCORDIA_EVENTS } from '../../../events/eventTypes';

import { eventSource } from '../../../st/script';
interface RenamePopupProps {
  currentName: string;
  charChatId?: string | number;
  groupChatId?: string;
}

const RenamePopup = ({
  currentName,
  charChatId,
  groupChatId,
}: RenamePopupProps) => {
  const { closePopup } = usePopup();
  const [newName, setNewName] = useState(currentName);

  const handleRename = useCallback(async () => {
    if (newName.trim() && newName !== currentName) {
      const { groups, characterId, groupId } = SillyTavern.getContext();

      let charId =
        typeof charChatId !== 'undefined' ? charChatId.toString() : undefined;
      let groupsId =
        typeof groupChatId !== 'undefined'
          ? groups.find((g) => g.id == groupChatId)?.id.toString()
          : undefined;

      let wasRecents = true;

      // We likely have the character selected
      if (!charId && !groupsId) {
        charId =
          typeof characterId !== 'undefined'
            ? characterId.toString()
            : undefined;
        groupsId = groupId !== null ? groupId.toString() : undefined;
        wasRecents = false;
      }

      if (!newName || (!charId && !groupsId)) return;

      try {
        await renameGroupOrCharacterChatFixed({
          groupId: groupsId,
          characterId: charId,
          oldFileName: currentName,
          newFileName: newName,
        });

        if (wasRecents) {
          await eventSource.emit(DISCORDIA_EVENTS.RECENTS_REFRESH);
        }
      } catch (error) {
        dislog.error('Error renaming chat:', error);
        toastr.error('Failed to rename chat. Please try again.');
      } finally {
        closePopup();
      }
    }
  }, [newName, currentName, charChatId, groupChatId, closePopup]);

  return (
    <div className="flex flex-col gap-4 w-96">
      <div>
        <Input
          label="New Name"
          value={newName}
          onChange={(e) => setNewName(e)}
        />
      </div>
      <div className="flex justify-end gap-2 mt-4 pb-2 ">
        <Button onClick={closePopup} look={ButtonLook.TRANSPARENT}>
          Cancel
        </Button>
        <Button onClick={handleRename} look={ButtonLook.PRIMARY}>
          Rename
        </Button>
      </div>
    </div>
  );
};

export default memo(RenamePopup);
