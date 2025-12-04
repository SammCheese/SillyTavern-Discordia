import React from 'react';

const { getThumbnailUrl, user_avatar } = await imports('@script');

const ProfilePersona = ({
  name,
  avatar,
}: {
  name: string;
  avatar: string | null;
}) => {
  const imageSrc = React.useMemo(() => {
    return getThumbnailUrl(
      'persona',
      avatar || user_avatar || 'user-default.png',
    );
  }, [avatar]);

  return (
    <>
      <div id="user-avatar">
        <img
          loading="lazy"
          id="discordia-avatar"
          src={imageSrc}
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
        <div id="user-name">{name}</div>
        <div id="user-status"></div>
      </div>
    </>
  );
};

export default ProfilePersona;
