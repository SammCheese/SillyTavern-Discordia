import React from 'react';

const AddCharacterIcon = ({
  onClick,
}: {
  onClick: (() => void) | undefined;
}) => {
  return (
    <div
      className="discord-entity-item avatar new-character-button"
      id="new-character-button"
      title="Add Character"
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      <svg
        aria-hidden="true"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" fill="transparent" className=""></circle>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm0-17a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H7a1 1 0 1 1 0-2h4V7a1 1 0 0 1 1-1Z"
          clipRule="evenodd"
          className=""
        ></path>
      </svg>
    </div>
  );
};

const MemoizedAddCharacterIcon = React.memo(AddCharacterIcon);

export default MemoizedAddCharacterIcon;
