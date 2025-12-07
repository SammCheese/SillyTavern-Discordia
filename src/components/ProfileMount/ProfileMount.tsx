import {
  useCallback,
  lazy,
  useState,
  useContext,
  useEffect,
  useMemo,
  memo,
} from 'react';
import { PageContext } from '../../providers/pageProvider';
import ProfilePersona from './ProfilePersona';

const UserSettings = lazy(
  () => import('../../pages/settings/user/UserSettings'),
);
const SamplerSettings = lazy(
  () => import('../../pages/settings/samplers/SamplerSettings'),
);
const ConnectionSettings = lazy(
  () => import('../../pages/settings/connection/ConnectionSettings'),
);

const { name1, eventSource, event_types } = await imports('@script');

const ProfileMount = ({
  avatar = null,
  icons = null,
}: {
  avatar?: string | null;
  icons?: Icon[] | null;
}) => {
  const [connStatus, setConnStatus] = useState<string>('no_connection');
  const { openPage } = useContext(PageContext);

  useEffect(() => {
    eventSource.on(event_types.ONLINE_STATUS_CHANGED, handleConnectionChange);

    return () => {
      eventSource.removeListener(
        event_types.ONLINE_STATUS_CHANGED,
        handleConnectionChange,
      );
    };
  }, []);

  const handleConnectionChange = useCallback(() => {
    if (SillyTavern.getContext().onlineStatus === 'no_connection') {
      setConnStatus('no_connection');
    } else {
      setConnStatus('online');
    }
  }, []);

  const handleIconClick = useCallback((icon: Icon) => {
    const id = icon.id;
    switch (id) {
      case '#user-settings-button':
        openPage(<UserSettings />);
        break;
      case '#ai-config-button':
        openPage(<SamplerSettings />);
        break;
      case '#sys-settings-button':
        openPage(<ConnectionSettings />);
        break;
      default:
        console.log(`No action defined for icon with id: ${id}`);
    }
  }, []);

  const isApiConnected = useMemo(() => {
    return connStatus !== 'no_connection';
  }, [connStatus]);

  const iconsToShow = useMemo(() => {
    return icons?.filter((i) => i.showInProfile) || [];
  }, [icons]);

  return (
    <div id="user-profile-container">
      <ProfilePersona name={name1} avatar={avatar} />
      <div id="user-settings-buttons">
        {iconsToShow.map((icon, index) => (
          <ProfileIcon
            apiConnected={isApiConnected}
            icon={icon}
            key={index}
            onClick={handleIconClick}
          />
        ))}
      </div>
    </div>
  );
};

interface ProfileIconProps {
  icon: Icon;
  onClick: (icon: Icon) => void;
  apiConnected?: boolean;
  enabled?: boolean;
}

const ProfileIcon = ({
  icon,
  onClick,
  apiConnected = false,
  enabled = true,
}: ProfileIconProps) => {
  // connection thing is a special cookie
  const isPlugIcon = icon.className.includes('fa-plug');

  const handleClick = () => {
    if (onClick && enabled) {
      onClick(icon);
    }
  };

  if (isPlugIcon) {
    return (
      <div
        className={
          apiConnected
            ? icon.className
                .replace('fa-plug-circle-exclamation', 'fa-plug')
                .replace('redOverlayGlow', '')
            : `${icon.className}`
        }
        title={icon.title}
        onClick={handleClick}
      />
    );
  } else {
    return (
      <div
        className={icon.className}
        title={icon.title}
        onClick={handleClick}
      />
    );
  }
};

export default memo(ProfileMount);
