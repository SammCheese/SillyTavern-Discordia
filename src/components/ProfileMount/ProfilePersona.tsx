import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PersonaSelector from './PersonaSelector';
import { useProfileContextMenu } from './hooks/ProfileContextMenu';

const { getThumbnailUrl } = await imports('@script');
const { getUserAvatars, setUserAvatar } = await imports('@scripts/personas');
const { power_user } = await imports('@scripts/powerUser');

const ProfilePersona = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { handleContextMenu } = useProfileContextMenu();

  const handleAvatarClick = useCallback(() => {
    setShowSelector((prev) => !prev);
  }, []);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const avatars = await getUserAvatars();
        const names = avatars.map((a) => power_user.personas[a] || a);
        setPersonas(
          avatars.map((avatar, index) => ({ name: names[index], avatar })),
        );
      } catch (error) {
        console.error('Error fetching user personas:', error);
      }
    };

    fetchPersonas();
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

  const handlePersonaSelect = useCallback((persona: Persona) => {
    setShowSelector(false);
    setUserAvatar(persona.avatar, { toastPersonaNameChange: true }).catch(
      (error) => {
        console.error('Error setting user avatar:', error);
      },
    );
    setCurrentPersona(persona);
  }, []);

  const name = useMemo(() => {
    return (
      power_user.personas[currentPersona?.avatar || 'user-default.png'] ||
      personas.find((p) => p.avatar === currentPersona?.avatar)?.name ||
      'User'
    );
  }, [currentPersona, personas]);

  const imageSrc = useMemo(() => {
    return getThumbnailUrl(
      'persona',
      currentPersona?.avatar || 'user-default.png',
    );
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
