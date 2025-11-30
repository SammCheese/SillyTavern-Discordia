import React from 'react';

const { getThumbnailUrl, user_avatar } = await imports('@script');

const ProfilePersona = ({
  name,
  avatar,
}: {
  name: string;
  avatar: string | null;
}) => {
  return (
    <>
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
        <div id="user-name">{name}</div>
        <div id="user-status"></div>
      </div>
    </>
  );
};

export default ProfilePersona;
