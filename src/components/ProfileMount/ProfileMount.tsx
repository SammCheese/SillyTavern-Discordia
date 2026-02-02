import { useCallback, lazy, useState, useEffect, useMemo, memo } from 'react';
import { usePage } from '../../providers/pageProvider';
import ProfilePersona from './ProfilePersona';
import ProfileIcon from './ProfileIcon';

const UserSettings = lazy(
  () => import('../../pages/settings/user/UserSettings'),
);
const SamplerSettings = lazy(
  () => import('../../pages/settings/samplers/SamplerSettings'),
);
const ConnectionSettings = lazy(
  () => import('../../pages/settings/connection/ConnectionSettings'),
);

const { eventSource, event_types } = await imports('@script');

interface ProfileMountProps {
  icons?: Icon[] | null;
}

const ProfileMount = ({ icons = null }: ProfileMountProps) => {
  const [connStatus, setConnStatus] = useState<string>('no_connection');
  const { openPage } = usePage();

  const handleConnectionChange = useCallback(() => {
    if (SillyTavern.getContext().onlineStatus === 'no_connection') {
      setConnStatus('no_connection');
    } else {
      setConnStatus('online');
    }
  }, []);

  useEffect(() => {
    eventSource.on(event_types.ONLINE_STATUS_CHANGED, handleConnectionChange);

    return () => {
      eventSource.removeListener(
        event_types.ONLINE_STATUS_CHANGED,
        handleConnectionChange,
      );
    };
  }, [handleConnectionChange]);

  const handleIconClick = useCallback(
    (icon: Icon) => {
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
    },
    [openPage],
  );

  const isApiConnected = useMemo(() => {
    return connStatus !== 'no_connection';
  }, [connStatus]);

  const iconsToShow = useMemo(() => {
    return icons?.filter((i) => i.showInProfile) || [];
  }, [icons]);

  return (
    <div id="user-profile-container">
      <ProfilePersona />
      <div id="user-settings-buttons">
        {iconsToShow.map((icon, index) => (
          <ProfileIcon
            apiConnected={isApiConnected}
            icon={icon}
            key={icon.id || index}
            onClick={handleIconClick}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(ProfileMount);
