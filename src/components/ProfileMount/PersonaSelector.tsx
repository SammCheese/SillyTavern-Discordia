import { memo, useCallback, useMemo } from 'react';

const { getThumbnailUrl } = await imports('@script');

interface PersonaSelectorProps {
  personas: Persona[];
  onSelect?: (persona: Persona) => void;
}

const PersonaSelector = ({ personas, onSelect }: PersonaSelectorProps) => {
  const sortedPersonas = useMemo(() => {
    return [...personas].sort((a, b) => a.avatar.localeCompare(b.avatar));
  }, [personas]);

  const handleSelect = useCallback(
    (persona: Persona) => {
      if (onSelect) {
        onSelect(persona);
      }
    },
    [onSelect],
  );

  if (!sortedPersonas.length) {
    return (
      <div className="p-3 text-sm text-gray-300">No personas available</div>
    );
  }

  return (
    <div className="max-h-64 w-64 overflow-y-auto rounded-md border border-gray-700 bg-base-discordia shadow-lg">
      {sortedPersonas.map((persona) => (
        <Persona
          key={persona.avatar}
          persona={persona}
          onClick={handleSelect}
        />
      ))}
    </div>
  );
};

interface PersonaProps {
  persona: Persona;
  onClick?: (persona: Persona) => void;
}

const Persona = memo(function Persona({ persona, onClick }: PersonaProps) {
  const thumbnail = useMemo(() => {
    return getThumbnailUrl('persona', persona.avatar || 'user-default.png');
  }, [persona]);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(persona);
    }
  }, [onClick, persona]);

  return (
    <button
      key={persona.avatar}
      className="cursor-pointer flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-lighter transition-colors"
      onClick={handleClick}
    >
      <img
        loading="lazy"
        src={thumbnail}
        alt={persona.name}
        className="h-8 w-8 rounded-full object-cover"
      />
      <span className="truncate">{persona.name}</span>
    </button>
  );
});

export default memo(PersonaSelector);
