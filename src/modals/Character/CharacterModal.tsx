import {
  useState,
  useContext,
  useEffect,
  useCallback,
  type ComponentProps,
  memo,
  useRef,
  useMemo,
} from 'react';
import { ModalContext } from '../../providers/modalProvider';
import Button, { ButtonLook } from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Modal from '../../components/common/Modal/Modal';
import Accordion from '../../components/common/Accordion/Accordion';
import {
  charToPayload,
  createCharacter,
  refreshCharacterList,
  updateCharacter,
  _deleteCharacter,
} from '../../services/characterService';

type Type = 'edit' | 'create';

type CharacterModalProps<T extends Type = Type> = T extends 'create'
  ? {
      type: T;
      onClose?: () => void;
      onSave?: () => void;
      avatarName?: string;
    }
  : {
      type?: T;
      onClose?: () => void;
      onSave?: () => void;
      avatarName: string;
    };

const { getThumbnailUrl } = await imports('@script');
const { getContext } = SillyTavern;

interface BoundInputProps extends Omit<
  ComponentProps<typeof Input>,
  'onChange' | 'value'
> {
  field: keyof Character;
  value?: string | number | undefined;
  onChange: (data: Partial<Character>) => void;
}

const BoundInput = memo(function BoundInput({
  field,
  value,
  onChange,
  ...props
}: BoundInputProps) {
  const handleChange = useCallback(
    (newValue: string) => {
      onChange({ [field]: newValue });
    },
    [onChange, field],
  );

  return <Input value={value || ''} onChange={handleChange} {...props} />;
});

const CharacterModal: React.FC<CharacterModalProps> = ({
  type = 'edit',
  onClose,
  avatarName,
  onSave,
}: CharacterModalProps) => {
  const [characterData, setCharacterData] = useState<Character | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [charId, setCharId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { closeModal } = useContext(ModalContext);

  const isNewCharacter = type === 'create';

  const defaultAvatarUrl = useMemo(
    () => getThumbnailUrl('avatar', 'default_Assistant.png'),
    [],
  );

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

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setAvatar(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    },
    [],
  );

  useEffect(() => {
    if (isNewCharacter) {
      setCharacterData({
        name: '',
        description: '',
        scenario: 'A chat between {{user}} and {{char}}.',
        first_mes: '',
        personality: '',
        creatorcomment: '',
        data: {},
      } as Character);
    } else {
      const character = getContext().characters.find(
        (ent) => ent.avatar?.toString() === avatarName,
      );
      if (character) {
        setCharacterData(character);

        const id = getContext().characters.indexOf(character);
        if (id !== -1) setCharId(id);

        setPreviewUrl(
          getThumbnailUrl('avatar', avatarName || 'default_Assistant.png'),
        );
      }
    }
  }, [avatarName, isNewCharacter]);

  const handleSave = useCallback(async () => {
    if (!characterData) return;

    try {
      const payload = charToPayload(characterData);

      if (avatar) {
        payload.avatar = avatar;
      }

      if (isNewCharacter) {
        await createCharacter(payload);
      } else {
        if (!avatarName) return;
        await updateCharacter(avatarName, payload);
      }
      if (onSave) {
        onSave();
      }

      await refreshCharacterList();

      closeModal();
    } catch (error) {
      console.error('Error saving character:', error);
    }
  }, [onSave, charId, closeModal, avatarName, characterData, type, avatar]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
    closeModal();
  }, [onClose, closeModal]);

  const handleDelete = useCallback(() => {
    if (!avatarName) return;
    _deleteCharacter(avatarName, { deleteChats: true }).then(async () => {
      closeModal();
    });
  }, [avatarName, closeModal]);

  const buttonLabel = useMemo(
    () => (isNewCharacter ? 'Create' : 'Save'),
    [isNewCharacter],
  );
  const title = useMemo(
    () => (isNewCharacter ? 'Create Character' : 'Edit Character'),
    [isNewCharacter],
  );

  const disabled = useMemo(() => {
    if (!characterData) return true;
    if (characterData.name.trim() === '') return true;
    return false;
  }, [characterData]);

  return (
    <Modal>
      <Modal.Header onClose={handleClose}>{title}</Modal.Header>
      <Modal.Content>
        <div id="avatar-name-edit" className="flex w-full align-top p-6">
          <div className="shrink-0 w-32 flex items-center">
            <div
              className="cursor-pointer  relative group"
              onClick={handleAvatarClick}
              title="Click to change avatar"
            >
              <img
                loading="lazy"
                src={previewUrl || defaultAvatarUrl}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-700 shrink-0 transition-opacity group-hover:opacity-50 group-hover:border-blue-500"
              />
              <div>
                <span className="text-sm text-center block mt-2">
                  Change Avatar
                </span>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
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
              disabled={!isNewCharacter}
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
            placeholder={'A chat between {{user}} and {{char}}.'}
            onChange={setCharData}
            growHeight={true}
          />
        </div>
      </Modal.Content>

      <Modal.Footer>
        {!isNewCharacter && (
          <div className="grow">
            <Button look={ButtonLook.DANGER} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )}
        <Button look={ButtonLook.TRANSPARENT} onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={disabled}>
          {buttonLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CharacterModal;
