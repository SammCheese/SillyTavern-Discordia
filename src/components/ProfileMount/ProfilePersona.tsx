import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProfileContextMenu } from './hooks/ProfileContextMenu';
import { usePersona } from '../../providers/contentProviders/personaProvider';

import PersonaSelector from './PersonaSelector';

const { getThumbnailUrl } = await imports('@script');

const ProfilePersona = () => {
  const { personas, currentPersona, setPersona } = usePersona();
  const { handleContextMenu } = useProfileContextMenu();

  const [showSelector, setShowSelector] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const defaultAvatar = getThumbnailUrl('persona', 'user-default.png');

  const handleAvatarClick = useCallback(() => {
    setShowSelector((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!showSelector) return;

    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSelector]);

  const handlePersonaSelect = useCallback(
    (persona: Persona) => {
      setShowSelector(false);
      setPersona(persona);
    },
    [setPersona],
  );

  const imageSrc = useMemo(() => {
    if (!currentPersona) return defaultAvatar;
    return currentPersona.avatarURL || defaultAvatar;
  }, [currentPersona, defaultAvatar]);

  const name = useMemo(() => {
    return currentPersona?.name || SillyTavern.getContext().name1 || 'Unknown';
  }, [currentPersona]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        id="profile-persona-container"
        className="hover:bg-lighter select-none w-full cursor-pointer flex items-center rounded-md transition-colors ease-in-out"
        onContextMenu={handleContextMenu}
        onClick={handleAvatarClick}
      >
        <div
          id="user-avatar"
          className="mx-1 h-10 w-10 shrink-0 flex items-center justify-center"
        >
          <img
            loading="lazy"
            id="discordia-avatar"
            src={imageSrc}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              objectFit: 'cover',
              cursor: 'pointer',
            }}
            alt="User Avatar"
          />
        </div>

        <div id="user-info">
          {' '}
          <div id="user-name" className="select-none">
            {name}
          </div>
          <div id="user-status"></div>
        </div>
      </div>

      {showSelector && personas.length > 0 && (
        <div className="absolute bottom-[calc(100%+8px)] -left-1 z-50">
          <PersonaSelector personas={personas} onSelect={handlePersonaSelect} />
        </div>
      )}
    </div>
  );
};

export default ProfilePersona;
