import {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  type ComponentProps,
  memo,
} from 'react';
import { ModalContext } from '../../providers/modalProvider';
import Button, { ButtonLook } from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Modal from '../../components/common/Modal/Modal';
import Accordion from '../../components/common/Accordion/Accordion';
import {
  charToPayload,
  updateCharacter,
} from '../../services/characterService';

interface CharacterEditModalProps {
  onClose?: () => void;
  avatarName: string;
  onSave?: () => void;
}

const { getThumbnailUrl, eventSource, event_types, deleteCharacter } =
  await imports('@script');
const { getContext } = SillyTavern;

interface BoundInputProps
  extends Omit<ComponentProps<typeof Input>, 'onChange' | 'value'> {
  field: keyof Character;
  value?: string | number | undefined;
  onChange: (data: Partial<Character>) => void;
}

// eslint-disable-next-line react/display-name
const BoundInput = memo(
  ({ field, value, onChange, ...props }: BoundInputProps) => {
    const handleChange = useCallback(
      (newValue: string) => {
        onChange({ [field]: newValue });
      },
      [onChange, field],
    );

    return <Input value={value || ''} onChange={handleChange} {...props} />;
  },
);

const CharacterEditModal: React.FC<CharacterEditModalProps> = ({
  onClose,
  avatarName,
  onSave,
}: CharacterEditModalProps) => {
  const [characterData, setCharacterData] = useState<Character | null>(null);
  const [charId, setCharId] = useState<number | null>(null);
  const { closeModal } = useContext(ModalContext);

  const setCharData = useCallback((data: Partial<Character>) => {
    setCharacterData((prev) => {
      if (!prev) return prev;

      // Mirror edits into V2 card while keeping V1 roots for compatibility
      const dataPatch: Record<string, unknown> = {};

      if ('name' in data) dataPatch.name = data.name;
      if ('description' in data) dataPatch.description = data.description;
      if ('scenario' in data) dataPatch.scenario = data.scenario;
      if ('personality' in data) dataPatch.personality = data.personality;
      if ('first_mes' in data) dataPatch.first_mes = data.first_mes;
      if ('mes_example' in data) dataPatch.mes_example = data.mes_example;
      if ('creatorcomment' in data)
        dataPatch.creator_notes = data.creatorcomment;

      const mergedData = Object.keys(dataPatch).length
        ? { ...(prev.data || {}), ...dataPatch }
        : prev.data;

      return { ...prev, ...data, data: mergedData } as Character;
    });
  }, []);

  const avatar = useMemo(() => {
    return getThumbnailUrl(
      'avatar',
      characterData?.avatar?.toString() || 'default',
    );
  }, [characterData?.avatar]);

  useEffect(() => {
    const character = getContext().characters.find(
      (ent) => ent.avatar?.toString() === avatarName,
    );
    if (character) {
      setCharacterData(character);

      const id = getContext().characters.indexOf(character);
      if (id !== -1) {
        setCharId(id);
      }
    }
  }, [avatarName]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave();
    }
    if (!characterData) return;

    const payload = charToPayload(characterData);
    updateCharacter(avatarName, payload).then(() => {
      eventSource.emit(event_types.CHARACTER_EDITED, {
        detail: { id: charId, character: characterData },
      });
      closeModal();
    });
  }, [onSave, charId, closeModal, avatarName, characterData]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
    closeModal();
  }, [onClose, closeModal]);

  const handleDelete = useCallback(() => {
    if (avatarName === null) return;
    deleteCharacter(avatarName, { deleteChats: true }).then(() => {
      closeModal();
    });
  }, [avatarName, closeModal]);

  return (
    <Modal>
      <Modal.Header onClose={handleClose}>Edit Character</Modal.Header>

      <Modal.Content>
        <div id="avatar-name-edit" className="flex w-full align-top p-6">
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
            <BoundInput
              id="name"
              field="name"
              value={characterData?.name}
              onChange={setCharData}
              placeholder="Enter character name"
            />
          </div>
        </div>

        <Accordion title="Creator Notes">
          <div id="creator-notes-edit" className="p-3 w-full space-y-2">
            <BoundInput
              id="creator_notes"
              field="creatorcomment"
              value={characterData?.creatorcomment}
              onChange={setCharData}
              growHeight={true}
              disabled={true}
            />
          </div>
        </Accordion>

        <div id="description-edit" className="p-3 w-full space-y-2">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="description"
          >
            Description
          </label>
          <BoundInput
            id="description"
            field="description"
            value={characterData?.description}
            onChange={setCharData}
            growHeight={true}
          />
        </div>

        <div id="first-message-edit" className="p-3 w-full space-y-2">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="first_message"
          >
            First Message
          </label>
          <BoundInput
            id="first_message"
            field="first_mes"
            value={characterData?.first_mes}
            onChange={setCharData}
            growHeight={true}
          />
        </div>

        <div id="scenario-edit" className="p-3 w-full space-y-2">
          <label className="block text-sm font-medium mb-1" htmlFor="scenario">
            Scenario
          </label>
          <BoundInput
            id="scenario"
            field="scenario"
            value={characterData?.scenario}
            defaultValue={'A chat between {{user}} and {{char}}.'}
            onChange={setCharData}
            growHeight={true}
          />
        </div>
      </Modal.Content>

      <Modal.Footer>
        <div className="grow">
          <Button look={ButtonLook.DANGER} onClick={handleDelete}>
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
