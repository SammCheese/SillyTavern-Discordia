import { memo, useCallback } from 'react';
import PersonaCard from './PersonaCard';
import { deletePersona, createPersona } from '../helper';
import { usePopup } from '../../../../providers/popupProvider';

interface PersonaSelectorProps {
  personas: FullPersona[];
  selectedPersona?: string;
  setSelectedPersona?: (avatar: string) => void;
  setPersonas: (prev) => void;
  defaultPersona: string;
  avatarRefreshNonce: number;
}

const PersonaSelector = ({
  personas,
  selectedPersona,
  setSelectedPersona,
  setPersonas,
  defaultPersona,
  avatarRefreshNonce,
}: PersonaSelectorProps) => {
  const { openPopup } = usePopup();

  const handleSetSelectedPersona = (avatar: string) => {
    setSelectedPersona?.(avatar);
  };

  const handleDelete = useCallback(
    (avatar: string) => {
      const performDelete = (avatar: string) => {
        try {
          deletePersona(avatar);
          if (selectedPersona === avatar) {
            setSelectedPersona?.('');
          }
          setPersonas((prev: FullPersona[]) =>
            prev.filter((p) => p.avatar !== avatar),
          );
        } catch (error) {
          dislog.error('Error deleting persona:', error);
          toastr.error('Failed to delete persona.');
        }
      };

      const persona = personas.find((p) => p.avatar === avatar);
      if (!persona) {
        toastr.error('Persona not found.');
        return;
      }

      if (personas.length <= 1) {
        toastr.error('At least one persona must be kept.');
        return;
      }

      if (persona.avatar === 'user-default.png') {
        toastr.error('The default persona cannot be deleted.');
        return;
      }

      openPopup(null, {
        title: 'Delete Persona',
        confirmVariant: 'danger',
        description: `Are you sure you want to delete "${persona.name}"? This action cannot be undone.`,
        onConfirm: () => performDelete(avatar),
      });
    },
    [openPopup, personas, selectedPersona, setPersonas, setSelectedPersona],
  );

  const handleNewPersona = useCallback(() => {
    const newPersona = {
      avatar: `persona-${Date.now()}.png`,
      name: `New Persona`,
      depth: 2,
      description: '',
      lorebook: '',
      position: 0,
      role: 0,
      title: '',
    };

    const updatedPersonas = [...personas, newPersona];
    setPersonas(updatedPersonas);
    setSelectedPersona?.(newPersona.avatar);
    createPersona(newPersona);

    return newPersona;
  }, [personas, setPersonas, setSelectedPersona]);

  return (
    <>
      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
        {personas.map((persona) => (
          <PersonaCard
            key={persona.avatar}
            persona={persona}
            selected={persona.avatar === selectedPersona}
            onSelect={handleSetSelectedPersona}
            onDelete={handleDelete}
            defaultPersona={defaultPersona}
            avatarRefreshNonce={avatarRefreshNonce}
          />
        ))}
        <div
          className="flex items-center justify-center p-2 border rounded-md border-base-discordia-lighter hover:bg-lighter cursor-pointer transition-colors duration-200 ease-out"
          onClick={handleNewPersona}
        >
          <div className="fa fa-solid fa-plus text-gray-500" />
        </div>
      </div>
    </>
  );
};

export default memo(PersonaSelector);
