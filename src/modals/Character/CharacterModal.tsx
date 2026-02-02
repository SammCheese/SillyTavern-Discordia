import {
  useState,
  useEffect,
  useCallback,
  type ComponentProps,
  memo,
  useRef,
  useMemo,
} from 'react';
import { useModal } from '../../providers/modalProvider';
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
import Divider from '../../components/common/Divider/Divider';
import TagManager from './TagManager';
import IconButton from '../../components/common/IconButton/IconButton';

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
  const [loading, setLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { closeModal } = useModal();

  const isNewCharacter = type === 'create';

  const defaultAvatarUrl = useMemo(
    () => getThumbnailUrl('avatar', 'default_Assistant.png'),
    [],
  );

  const existingCharacter = useMemo(() => {
    if (!avatarName) return null;
    return getContext().characters.find(
      (ent) => ent.avatar?.toString() === avatarName,
    );
  }, [avatarName]);

  useEffect(() => {
    if (existingCharacter) {
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setCharacterData((prev) => prev || existingCharacter);

      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setPreviewUrl(
        getThumbnailUrl('avatar', avatarName || 'default_Assistant.png'),
      );
    } else {
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setCharacterData({
        name: '',
        description: '',
        scenario: 'A chat between {{user}} and {{char}}.',
        first_mes: '',
        personality: '',
        creatorcomment: '',
        data: {},
      } as Character);
    }
  }, [avatarName, existingCharacter]);

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
      if ('tags' in data) dataPatch.tags = data.tags;
      if ('fav' in data) dataPatch.fav = data.fav;
      if ('talkativeness' in data) dataPatch.talkativeness = data.talkativeness;

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

  const handleSave = useCallback(async () => {
    if (!characterData) return;

    setLoading(true);

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

      refreshCharacterList();

      closeModal();
    } catch (error) {
      console.error('Error saving character:', error);
    } finally {
      setLoading(false);
    }
  }, [characterData, avatar, isNewCharacter, onSave, closeModal, avatarName]);

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

  const handleFavoriteToggle = useCallback(() => {
    setCharData({ fav: !characterData?.fav });
  }, [setCharData, characterData?.fav]);

  const buttonLabel = useMemo(
    () => (isNewCharacter ? 'Create' : 'Save'),
    [isNewCharacter],
  );
  const title = useMemo(
    () => (isNewCharacter ? 'Create Character' : 'Edit Character'),
    [isNewCharacter],
  );

  const disabled = useMemo(() => {
    if (loading) return true;
    if (!characterData) return true;
    if (characterData.name.trim() === '') return true;
    return false;
  }, [characterData, loading]);

  return (
    <Modal>
      <Modal.Header onClose={handleClose}>{title}</Modal.Header>
      <Modal.Content>
        <div id="avatar-name-edit" className="flex w-full p-6">
          <div className="shrink-0 w-32 flex items-center justify-center flex-col">
            <div
              className="cursor-pointer relative group"
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

          <div className="grow  ms-4 relative flex items-center bottom-4">
            <div className="grow relative">
              <label
                className="block text-sm font-medium mb-1 absolute -top-6"
                htmlFor="name"
              >
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

            <div className="ms-2">
              <IconButton
                faIcon="fa fa-solid fa-star"
                color={characterData?.fav ? 'yellow' : 'white'}
                onClick={handleFavoriteToggle}
              />
            </div>
          </div>
        </div>

        <Divider />

        <Accordion title="Tags">
          <div className="px-6 mt-4 mb-4">
            <TagManager
              characterData={characterData}
              setCharData={setCharData}
            />
          </div>
        </Accordion>

        <Accordion title="Creator Notes">
          <div id="creator-notes-edit">
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

        <div id="description-edit" className="mt-4">
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

        <div id="first-message-edit" className="mb-4 mt-4">
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

        <Accordion title="Advanced">
          <div id="example-edit" className="mt-4">
            <label className="block text-sm font-medium mb-1" htmlFor="example">
              Example Conversation
            </label>
            <BoundInput
              id="example"
              field="mes_example"
              value={characterData?.mes_example}
              placeholder={`<START>\n{{char}}: Hello!\n{{user}}: Hi there!`}
              onChange={setCharData}
              growHeight={true}
              initialHeight={80}
            />
          </div>

          <div id="scenario-edit" className="mb-4 mt-4">
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="scenario"
            >
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
        </Accordion>
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
