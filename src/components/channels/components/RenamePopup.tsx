import { memo, useCallback, useState } from 'react';
import Input from '../../common/Input/Input';
import Button, { ButtonLook } from '../../common/Button/Button';
import { usePopup } from '../../../providers/popupProvider';

interface RenamePopupProps {
  currentName: string;
  charId?: string | number;
  groupChatId?: string;
}

const { renameGroupOrCharacterChat, closeCurrentChat } =
  await imports('@script');

const RenamePopup = ({
  currentName,
  charId,
  groupChatId,
}: RenamePopupProps) => {
  const { closePopup } = usePopup();
  const [newName, setNewName] = useState(currentName);

  const handleRename = useCallback(async () => {
    if (newName.trim() && newName !== currentName) {
      const { characterId, groupId, chatId } = SillyTavern.getContext();

      const groupchat = groupChatId
        ? groupChatId
        : groupId
          ? groupId.toString()
          : undefined;
      const charchat = charId
        ? charId.toString()
        : characterId
          ? characterId.toString()
          : undefined;

      if (!newName) return;

      try {
        if (chatId && chatId.includes(currentName)) {
          const res = await closeCurrentChat();
          if (!res) {
            throw new Error('Failed to close current chat for renaming');
          }
        }

        await renameGroupOrCharacterChat({
          groupId: groupchat,
          characterId: charchat,
          oldFileName: currentName,
          newFileName: newName,
        });
      } catch (error) {
        dislog.error('Error renaming chat:', error);
        toastr.error('Failed to rename chat. Please try again.');
      } finally {
        closePopup();
      }
    }
  }, [newName, currentName, groupChatId, charId, closePopup]);

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
