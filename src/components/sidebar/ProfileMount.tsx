import React from 'react';
import { PageContext } from '../../providers/pageProvider';

const UserSettings = React.lazy(
  () => import('../../pages/settings/user/UserSettings'),
);

const { getThumbnailUrl, name1, user_avatar, eventSource, event_types } =
  await imports('@script');

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
      <div id="user-avatar">
        <img
          loading="lazy"
          id="discordia-avatar"
          src={getThumbnailUrl(
            'persona',
            avatar || user_avatar || 'user-default.png',
          )}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover',
            cursor: 'pointer',
          }}
          alt="User Avatar"
        />
      </div>

      <div id="user-info">
        {' '}
        <div id="user-name">{name1}</div>
        <div id="user-status"></div>
      </div>
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
              onClick={() => handleIconClick(icon)}
            />
          ))}
      </div>
    </div>
  );
};

const ProfileIcon = ({
  icon,
  key,
  onClick,
  enabled = true,
}: {
  icon: Icon;
  key: string | number;
  onClick: () => void;
  enabled?: boolean;
}) => {
  // connection thing is a special cookie
  const isPlugIcon = icon.className.includes('fa-plug');

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
        key={key}
        onClick={onClick}
      />
    );
  } else {
    return (
      <div
        className={icon.className}
        title={icon.title}
        key={key}
        onClick={onClick}
      />
    );
  }
};

export default ProfileMount;
