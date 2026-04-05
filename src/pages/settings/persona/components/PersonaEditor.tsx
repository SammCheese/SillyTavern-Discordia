import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Input from '../../../../components/common/Input/Input';
import Select from '../../../../components/common/Select/Select';
import IconButton from '../../../../components/common/IconButton/IconButton';

interface PersonaEditorProps {
  personas: FullPersona[];
  setPersonas: React.Dispatch<React.SetStateAction<FullPersona[]>>;
  selectedPersona: string;
  defaultPersona: string;
  setDefaultPersona: React.Dispatch<React.SetStateAction<string>>;
}

const { persona_description_positions } = await imports('@scripts/powerUser');

const PersonaEditor = ({
  personas,
  selectedPersona,
  setPersonas,
  defaultPersona,
  setDefaultPersona,
}: PersonaEditorProps) => {
  const [persona, setPersona] = useState(
    personas.find((p) => p.avatar === selectedPersona),
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    setPersona(personas.find((p) => p.avatar === selectedPersona));
  }, [selectedPersona, personas]);

  const updateField = useMemo(() => {
    return (field: keyof FullPersona, value: string | number) => {
      setPersona((prev) => {
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
      persona?.avatar || '';
    setDefaultPersona(persona?.avatar || '');
  }, [persona?.avatar, setDefaultPersona]);

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
      {persona ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-1 items-center justify-end w-full">
            <Input
              value={persona?.name || ''}
              onChange={handleNameChange}
              placeholder="Enter a name for this persona..."
            />
            <IconButton
              faIcon="fa-solid fa-crown"
              tooltip="Make Default"
              color={persona?.avatar === defaultPersona ? 'yellow' : 'gray'}
              onClick={handleDefaultChange}
            />
          </div>
          <div>
            <Input
              value={persona?.description || ''}
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
              value={persona.position ?? persona_description_positions.NONE}
              options={positionOptions}
              onChange={handlePositionChange}
            />
            {persona.position === persona_description_positions.AT_DEPTH && (
              <Input
                value={persona.depth?.toString() || ''}
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
