import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import { ContextMenuContext } from '../../providers/contextMenuProvider';
import { logout } from '../../utils/userUtils';
import PersonaSelector from './PersonaSelector';

const { getThumbnailUrl } = await imports('@script');
const { getUserAvatars, setUserAvatar } = await imports('@scripts/personas');
const { power_user } = await imports('@scripts/powerUser');

const ProfilePersona = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { showContextMenu } = useContext(ContextMenuContext);

  const handleLogout = useCallback(() => {
    logout().catch((error) => {
      console.error('Error during logout:', error);
    });
  }, []);

  const handleAvatarClick = useCallback(() => {
    setShowSelector((prev) => !prev);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
        );
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error(
          `Error attempting to exit full-screen mode: ${err.message} (${err.name})`,
        );
      });
    }
  }, [document.fullscreenElement]);

  const handleRightClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      showContextMenu(e, [
        {
          label: `${document.fullscreenElement ? 'Exit' : 'Enter'} Fullscreen`,
          onClick: handleFullscreen,
        },
        {
          label: 'Log Out',
          variant: 'danger',
          onClick: handleLogout,
        },
      ]);
    },
    [showContextMenu, handleLogout, handleFullscreen],
  );

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
  }, [power_user]);

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
  }, [currentPersona, personas, power_user]);

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
        onContextMenu={handleRightClick}
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
        <div className="absolute bottom-[calc(100%+8px)] left-0 z-50">
          <PersonaSelector personas={personas} onSelect={handlePersonaSelect} />
        </div>
      )}
    </div>
  );
};

export default ProfilePersona;
