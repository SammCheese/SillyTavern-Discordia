import { useMemo } from 'react';

const { getThumbnailUrl, user_avatar } = await imports('@script');

const ProfilePersona = ({
  name,
  avatar,
}: {
  name: string;
  avatar: string | null;
}) => {
  const imageSrc = useMemo(() => {
    return getThumbnailUrl(
      'persona',
      avatar || user_avatar || 'user-default.png',
    );
  }, [avatar]);

  return (
    <div
      id="profile-persona-container"
      className="hover:bg-lighter w-full cursor-pointer flex items-center rounded-md transition-colors ease-in-out"
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
  );
};

export default ProfilePersona;
