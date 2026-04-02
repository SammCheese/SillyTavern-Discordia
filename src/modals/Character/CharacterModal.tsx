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
import Tooltip from '../../components/common/Tooltip/Tooltip';

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
  field: keyof Character | keyof CharacterV2Data;
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

const CharacterModal = ({
  type = 'edit',
  onClose,
  avatarName,
  onSave,
}: CharacterModalProps) => {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { closeModal } = useModal();

  const isNewCharacter = type === 'create';

  const defaultAvatarUrl = useMemo(
    () => getThumbnailUrl('avatar', 'default_Assistant.png'),
    [],
  );

  const existingCharacter = useMemo(
    () =>
      !isNewCharacter && avatarName
        ? getContext().characters.find(
            (ent) => ent.avatar?.toString() === avatarName,
          )
        : null,
    [avatarName, isNewCharacter],
  );

  const [characterData, setCharacterData] = useState<Character | null>(() => {
    if (existingCharacter) return existingCharacter;
    return {
      name: '',
      description: '',
      scenario: 'A chat between {{user}} and {{char}}.',
      first_mes: '',
      personality: '',
      creatorcomment: '',
      data: { extensions: {} },
    } as Character;
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    if (existingCharacter) {
      return getThumbnailUrl('avatar', avatarName || 'default_Assistant.png');
    }
    return null;
  });

  const setCharData = useCallback(
    (data: Partial<Character | CharacterV2Data>) => {
      setCharacterData((prev) => {
        if (!prev) return prev;

        const v1Data: Character = {
          ...prev,
          ...data,
        };
        const v2Data: Partial<CharacterV2Data> = {
          ...prev.data,
          extensions: {
            ...(prev.data?.extensions || {}),
          } as v2ExtensionInfos,
        };

        const v1ToV2Keys = [
          'name',
          'description',
          'scenario',
          'personality',
          'first_mes',
          'mes_example',
          'tags',
          'system_prompt',
          'post_history_instructions',
          'creator_notes',
          'creator',
          'character_version',
          'alternate_greetings',
        ] as (keyof Character | keyof CharacterV2Data)[];
        v1ToV2Keys.forEach((k) => {
          if (k in data) v2Data[k] = data[k];
        });

        const mergedData = Object.assign({}, v1Data, { data: v2Data });

        return mergedData;
      });
    },
    [],
  );

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

      onSave?.();
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

  const handleDelete = useCallback(async () => {
    if (!avatarName) return;
    await _deleteCharacter(avatarName, { deleteChats: true });
    closeModal();
  }, [avatarName, closeModal]);

  const handleFavoriteToggle = useCallback(() => {
    setCharData({ fav: !characterData?.fav });
  }, [characterData?.fav, setCharData]);

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
              initialHeight={80}
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
            initialHeight={80}
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
            initialHeight={80}
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
              initialHeight={80}
            />
          </div>

          <div id="sysprompt-edit" className="mb-4 mt-4">
            <div className="flex items-center gap-2 mb-1">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="system_prompt"
              >
                System Prompt
              </label>
              <Tooltip text="Use {{original}} to include the original system prompt.">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  shape-rendering="geometricPrecision"
                  text-rendering="geometricPrecision"
                  image-rendering="optimizeQuality"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  viewBox="0 0 512 512"
                  color="gray"
                  className="w-4 h-4  fill-gray-400"
                >
                  <path
                    fill-rule="nonzero"
                    d="M256 0c70.69 0 134.7 28.66 181.02 74.98C483.34 121.31 512 185.31 512 256c0 70.69-28.66 134.7-74.98 181.02C390.7 483.34 326.69 512 256 512c-70.69 0-134.69-28.66-181.02-74.98C28.66 390.7 0 326.69 0 256c0-70.69 28.66-134.69 74.98-181.02C121.31 28.66 185.31 0 256 0zm-21.49 301.51v-2.03c.16-13.46 1.48-24.12 4.07-32.05 2.54-7.92 6.19-14.37 10.97-19.25 4.77-4.92 10.51-9.39 17.22-13.46 4.31-2.74 8.22-5.78 11.68-9.18 3.45-3.36 6.19-7.27 8.23-11.69 2.02-4.37 3.04-9.24 3.04-14.62 0-6.4-1.52-11.94-4.57-16.66-3-4.68-7.06-8.28-12.04-10.87-5.03-2.54-10.61-3.81-16.76-3.81-5.53 0-10.81 1.11-15.89 3.45-5.03 2.29-9.25 5.89-12.55 10.77-3.3 4.87-5.23 11.12-5.74 18.74h-32.91c.51-12.95 3.81-23.92 9.85-32.91 6.1-8.99 14.13-15.8 24.08-20.42 10.01-4.62 21.08-6.9 33.16-6.9 13.31 0 24.89 2.43 34.84 7.41 9.96 4.93 17.73 11.83 23.27 20.67 5.48 8.84 8.28 19.1 8.28 30.88 0 8.08-1.27 15.34-3.81 21.79-2.54 6.45-6.1 12.24-10.77 17.27-4.68 5.08-10.21 9.54-16.71 13.41-6.15 3.86-11.12 7.82-14.88 11.93-3.81 4.11-6.56 8.99-8.28 14.58-1.73 5.63-2.69 12.59-2.84 20.92v2.03h-30.94zm16.36 65.82c-5.94-.04-11.02-2.13-15.29-6.35-4.26-4.21-6.35-9.34-6.35-15.33 0-5.89 2.09-10.97 6.35-15.19 4.27-4.21 9.35-6.35 15.29-6.35 5.84 0 10.92 2.14 15.18 6.35 4.32 4.22 6.45 9.3 6.45 15.19 0 3.96-1.01 7.62-2.99 10.87-1.98 3.3-4.57 5.94-7.82 7.87-3.25 1.93-6.86 2.9-10.82 2.94zM417.71 94.29C376.33 52.92 319.15 27.32 256 27.32c-63.15 0-120.32 25.6-161.71 66.97C52.92 135.68 27.32 192.85 27.32 256c0 63.15 25.6 120.33 66.97 161.71 41.39 41.37 98.56 66.97 161.71 66.97 63.15 0 120.33-25.6 161.71-66.97 41.37-41.38 66.97-98.56 66.97-161.71 0-63.15-25.6-120.32-66.97-161.71z"
                  />
                </svg>
              </Tooltip>
            </div>
            <BoundInput
              id="system_prompt"
              field="system_prompt"
              value={characterData?.data?.system_prompt}
              placeholder={'You are {{char}}, a helpful assistant.'}
              onChange={setCharData}
              growHeight={true}
              initialHeight={80}
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
