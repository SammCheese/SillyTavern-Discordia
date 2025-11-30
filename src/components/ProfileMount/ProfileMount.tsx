import React from 'react';
import { PageContext } from '../../providers/pageProvider';
import ProfilePersona from './ProfilePersona';

const UserSettings = React.lazy(
  () => import('../../pages/settings/user/UserSettings'),
);

const { name1, eventSource, event_types } = await imports('@script');

const ProfileMount = ({
  avatar,
  icons,
}: {
  avatar: string | null;
  icons: Icon[] | null;
}) => {
  const [connStatus, setConnStatus] = React.useState<string>('no_connection');

  const pageContext = React.useContext(PageContext);

  React.useEffect(() => {
    eventSource.on(event_types.ONLINE_STATUS_CHANGED, handleConnectionChange);

    return () => {
      eventSource.removeListener(
        event_types.ONLINE_STATUS_CHANGED,
        handleConnectionChange,
      );
    };
  }, []);

  const handleConnectionChange = () => {
    if (SillyTavern.getContext().onlineStatus === 'no_connection') {
      setConnStatus('no_connection');
    } else {
      setConnStatus('online');
    }
  };

  const handleIconClick = (icon: Icon) => {
    const id = icon.id;
    switch (id) {
      case '#user-settings-button':
        pageContext.openPage(<UserSettings />);
        break;
      case '#ai-config-button':
        console.log('AI Config Button Clicked');
        break;
      case '#sys-settings-button':
        console.log('System Settings Button Clicked');
        break;
      default:
        console.log(`No action defined for icon with id: ${id}`);
    }
  };

  return (
    <div id="user-profile-container">
      <ProfilePersona name={name1} avatar={avatar} />
      <div id="user-settings-buttons">
        {icons
          ?.filter((i) => i.showInProfile)
          ?.map((icon, index) => (
            <ProfileIcon
              enabled={
                icon.className.includes('fa-plug') &&
                connStatus === 'no_connection'
                  ? false
                  : true
              }
              icon={icon}
              key={index}
              onClick={handleIconClick}
            />
          ))}
      </div>
    </div>
  );
};

const ProfileIcon = ({
  icon,
  onClick,
  enabled = true,
}: {
  icon: Icon;
  onClick: (icon: Icon) => void;
  enabled?: boolean;
}) => {
  // connection thing is a special cookie
  const isPlugIcon = icon.className.includes('fa-plug');

  const handleClick = () => {
    if (enabled) {
      onClick(icon);
    }
  };

  if (isPlugIcon) {
    return (
      <div
        className={
          enabled
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

export default React.memo(ProfileMount);
