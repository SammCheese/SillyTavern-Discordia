import { memo, useCallback, useMemo } from 'react';

const { getThumbnailUrl } = await imports('@script');

interface PersonaCardProps {
  persona: FullPersona;
  selected?: boolean;
  onSelect?: (avatar: string) => void;
  onDelete?: (avatar: string) => void;
  defaultPersona: string;
}

const PersonaCard = ({
  persona,
  selected,
  onSelect,
  onDelete,
  defaultPersona,
}: PersonaCardProps) => {
  const imgSrc = useMemo(() => {
    return getThumbnailUrl('persona', persona.avatar ?? 'default-user.png');
  }, [persona.avatar]);

  const handleDelete = useCallback(() => {
    onDelete?.(persona.avatar);
  }, [onDelete, persona.avatar]);

  const handleClick = useCallback(() => {
    onSelect?.(persona.avatar);
  }, [persona.avatar, onSelect]);

  const isDefault = useMemo(() => {
    return (
      defaultPersona === persona.avatar ||
      SillyTavern.getContext().powerUserSettings.default_persona ===
        persona.avatar
    );
  }, [defaultPersona, persona.avatar]);

  return (
    <div
      className="flex flex-row items-center gap-4 p-2 border rounded-md border-base-discordia-lighter hover:bg-base-discordia-lighter/20 transition-colors duration-200 ease-out cursor-pointer"
      title={persona.name}
      style={{
        backgroundColor: selected ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      }}
      onClick={handleClick}
    >
      <div className="w-16 h-16 min-w-16 min-h-16">
        <img
          loading="lazy"
          src={imgSrc}
          alt={persona.name || 'Persona Avatar'}
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="flex flex-col w-full min-w-0 overflow-hidden">
        <span className="font-medium">{persona.name || 'Unnamed'}</span>
        <span className="text-sm text-gray-500 truncate">
          {persona.description || 'No description'}
        </span>
      </div>

      <div className="flex flex-row gap-1 items-center justify-end">
        {isDefault && (
          <div
            title="Default Persona"
            className="fa fa-solid fa-crown text-yellow-500 w-8 h-8 flex items-center justify-center rounded-md"
          />
        )}

        {persona.avatar !== 'user-default.png' && (
          <div
            title="Delete Persona"
            className="fa fa-solid fa-trash cursor-pointer text-red-500 w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/10 transition-colors duration-200 ease-out"
            onClick={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default memo(PersonaCard);
