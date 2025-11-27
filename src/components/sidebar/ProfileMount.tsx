import React from 'react';
import { PageContext } from '../../providers/pageProvider';

const UserSettings = React.lazy(
  () => import('../../pages/settings/user/UserSettings'),
);

const { getThumbnailUrl, name1, user_avatar } = await imports('@script');

const ProfileMount = ({
  avatar,
  icons,
}: {
  avatar: string | null;
  icons: Icon[] | null;
}) => {
  const pageContext = React.useContext(PageContext);

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
            <div
              className={icon.className}
              title={icon.title}
              key={index}
              onClick={() => {
                handleIconClick(icon);
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default ProfileMount;
