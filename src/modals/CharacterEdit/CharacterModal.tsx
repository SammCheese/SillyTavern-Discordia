import { useState, useContext, useEffect, useMemo } from 'react';
import { ModalContext } from '../../providers/modalProvider';
import Button, { ButtonLook } from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Modal from '../../components/common/Modal/Modal';

interface CharacterEditModalProps {
  onClose?: () => void;
  avatarName: string;
  onSave?: () => void;
}

const { getThumbnailUrl } = await imports('@script');
const { getContext } = SillyTavern;

const CharacterEditModal: React.FC<CharacterEditModalProps> = ({
  onClose,
  avatarName,
  onSave,
}: CharacterEditModalProps) => {
  const [characterData, setCharacterData] = useState<Character | null>(null);
  const { closeModal } = useContext(ModalContext);

  useEffect(() => {
    const character = getContext().characters.find(
      (ent) => ent.avatar?.toString() === avatarName,
    );
    if (character) {
      setCharacterData(character);
    }
  }, [avatarName]);

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    closeModal();
  };

  const avatar = useMemo(() => {
    return getThumbnailUrl(
      'avatar',
      characterData?.avatar?.toString() || 'default',
    );
  }, [characterData]);

  return (
    <Modal>
      <Modal.Header onClose={handleClose}>Edit Character</Modal.Header>

      <Modal.Content>
        <div className="flex w-full align-top p-6">
          <div className="w-32 flex items-center">
            <img
              loading="lazy"
              src={avatar}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-700 shrink-0"
            />
          </div>
          <div className="grow space-y-2 ms-4 relative top-4">
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Name
            </label>
            <Input
              id="name"
              type="text"
              value={characterData?.name}
              onChange={() => {}}
            />
          </div>
        </div>
        <div className="p-3 w-full space-y-2">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="description"
          >
            Description
          </label>
          <Input
            id="description"
            type="text"
            value={characterData?.description}
            onChange={() => {}}
            growHeight={true}
          />
        </div>
        <div className="p-3 w-full space-y-2">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="first_message"
          >
            First Message
          </label>
          <Input
            id="first_message"
            type="text"
            value={characterData?.first_mes}
            onChange={() => {}}
            growHeight={true}
          />
        </div>
      </Modal.Content>

      <Modal.Footer>
        <div className="grow">
          <Button look={ButtonLook.DANGER} onClick={handleClose}>
            Delete
          </Button>
        </div>
        <Button look={ButtonLook.TRANSPARENT} onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CharacterEditModal;
