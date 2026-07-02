import {
  type ChangeEvent,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import Input from '../../../../components/common/Input/Input';
import Select from '../../../../components/common/Select/Select';
import IconButton from '../../../../components/common/IconButton/IconButton';
import { updatePersonaAvatarImage, withCacheBust } from '../helper';

import { persona_description_positions } from '../../../../st/powerUser';
import { getThumbnailUrl } from '../../../../st/script';
import { setUserAvatar } from '../../../../st/personas';
interface PersonaEditorProps {
  personas: FullPersona[];
  setPersonas: React.Dispatch<React.SetStateAction<FullPersona[]>>;
  selectedPersona: string;
  defaultPersona: string;
  setDefaultPersona: React.Dispatch<React.SetStateAction<string>>;
  avatarRefreshNonce: number;
  onAvatarUpdated: () => void;
}

const PersonaEditor = ({
  personas,
  selectedPersona,
  setPersonas,
  defaultPersona,
  setDefaultPersona,
  avatarRefreshNonce,
  onAvatarUpdated,
}: PersonaEditorProps) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [localPersona, setLocalPersona] = useState(
    personas.find((p) => p.avatar === selectedPersona),
  );
  const [prevSelectedPersona, setPrevSelectedPersona] =
    useState(selectedPersona);

  const [avatarUploadPending, setAvatarUploadPending] = useState(false);

  if (selectedPersona !== prevSelectedPersona) {
    setPrevSelectedPersona(selectedPersona);
    setLocalPersona(
      personas.find((p) => p.avatar === selectedPersona) || undefined,
    );
  }

  const updateField = useMemo(() => {
    return (field: keyof FullPersona, value: string | number) => {
      setLocalPersona((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, [field]: value };
        return updated;
      });

      setPersonas((prev) =>
        prev.map((p) =>
          p.avatar === selectedPersona ? { ...p, [field]: value } : p,
        ),
      );
    };
  }, [selectedPersona, setPersonas]);

  const handleNameChange = useMemo(() => {
    return (value: string) => {
      updateField('name', value);
    };
  }, [updateField]);

  const handleDescriptionChange = useMemo(() => {
    return (value: string) => {
      updateField('description', value);
    };
  }, [updateField]);

  const handlePositionChange = useMemo(() => {
    return (value: number | string) => {
      const numericValue =
        typeof value === 'string' ? parseInt(value, 10) : value;
      updateField('position', numericValue);
    };
  }, [updateField]);

  const handleDefaultChange = useCallback(() => {
    // @ts-expect-error false typing
    SillyTavern.getContext().powerUserSettings.default_persona =
      localPersona?.avatar || '';
    setDefaultPersona(localPersona?.avatar || '');
    setUserAvatar(localPersona?.avatar ?? 'user-default.png', {
      toastPersonaNameChange: true,
    });
  }, [localPersona?.avatar, setDefaultPersona]);

  const personaAvatar = useMemo(() => {
    if (!localPersona || !localPersona?.avatar) {
      return '';
    }

    return withCacheBust(
      getThumbnailUrl('persona', localPersona.avatar),
      avatarRefreshNonce,
    );
  }, [avatarRefreshNonce, localPersona]);

  const handleOpenAvatarPicker = useCallback(() => {
    avatarInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';

      if (!localPersona || !file) {
        return;
      }

      setAvatarUploadPending(true);

      try {
        const currentAvatar = localPersona.avatar;
        const updatedAvatar = await updatePersonaAvatarImage(
          currentAvatar,
          file,
        );

        if (updatedAvatar !== currentAvatar) {
          setLocalPersona((prev) =>
            prev ? { ...prev, avatar: updatedAvatar } : prev,
          );

          setPersonas((prev) =>
            prev.map((persona) =>
              persona.avatar === currentAvatar
                ? { ...persona, avatar: updatedAvatar }
                : persona,
            ),
          );

          if (defaultPersona === currentAvatar) {
            setDefaultPersona(updatedAvatar);
          }
        } else {
          setPersonas((prev) =>
            prev.map((persona) =>
              persona.avatar === currentAvatar ? { ...persona } : persona,
            ),
          );
        }

        onAvatarUpdated();

        toastr.success(
          'Persona image updated.',
          localPersona.name || 'Persona',
        );
      } catch (error) {
        console.error('Failed to update persona image', error);
        toastr.error('Failed to update persona image.', 'Persona');
      } finally {
        setAvatarUploadPending(false);
      }
    },
    [
      defaultPersona,
      localPersona,
      onAvatarUpdated,
      setDefaultPersona,
      setPersonas,
    ],
  );

  const positionOptions = [
    {
      value: persona_description_positions.IN_PROMPT,
      label: 'In Story String / Prompt Manager',
    },
    {
      value: persona_description_positions.TOP_AN,
      label: 'Top of Authors Note',
    },
    {
      value: persona_description_positions.BOTTOM_AN,
      label: 'Bottom of Authors Note',
    },
    { value: persona_description_positions.AT_DEPTH, label: 'In-Chat @ depth' },
    { value: persona_description_positions.NONE, label: 'None (disabled)' },
  ];

  return (
    <div className="persona-editor p-4 rounded">
      <h2 className="text-lg font-semibold mb-4">Edit Persona</h2>
      {localPersona ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-1 items-center justify-end w-full">
            <div className="flex flex-row items-center gap-3">
              <div className="flex flex-col gap-2 cursor-pointer">
                <button
                  className="rounded-full border border-base-discordia-lighter hover:border-gray-500 hover:bg-gray-700/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleOpenAvatarPicker}
                  disabled={avatarUploadPending}
                >
                  <div className="w-18 h-18 min-w-18 min-h-18 rounded-full overflow-hidden border border-base-discordia-lighter bg-base-discordia-lighter/10">
                    <img
                      src={personaAvatar}
                      alt={localPersona?.name || 'Persona Avatar'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </button>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <Input
              value={localPersona?.name || ''}
              onChange={handleNameChange}
              placeholder="Enter a name for this persona..."
            />
            <IconButton
              faIcon="fa-solid fa-crown"
              tooltip="Make Default"
              color={
                localPersona?.avatar === defaultPersona ? 'yellow' : 'gray'
              }
              onClick={handleDefaultChange}
            />
          </div>
          <div>
            <Input
              value={localPersona?.description || ''}
              onChange={handleDescriptionChange}
              label="Description"
              placeholder={`Example:\n[{{user}} is a 28-year-old Romanian cat girl.]`}
              growHeight
              initialHeight={150}
              maxHeight={300}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Position</label>
            <Select
              value={
                localPersona?.position ?? persona_description_positions.NONE
              }
              options={positionOptions}
              onChange={handlePositionChange}
            />
            {localPersona?.position ===
              persona_description_positions.AT_DEPTH && (
              <Input
                value={localPersona?.depth?.toString() || ''}
                onChange={(value) => updateField('depth', parseInt(value, 10))}
                label="Depth"
                type="number"
              />
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Select a persona to edit its details.
        </p>
      )}
    </div>
  );
};

export default memo(PersonaEditor);
