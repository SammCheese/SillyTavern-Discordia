import { memo } from 'react';

const CloseButton = () => {
  return (
    <>
      <div
        style={{ flex: '0 0 36px' }}
        className="group-hover:border-gray-50 items-center rounded-full border-2 border-gray-600 cursor-pointer w-9 h-9 flex justify-center box-border"
      >
        <svg
          aria-hidden="true"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z"
          ></path>
        </svg>
      </div>
      <div className="group-hover:text-gray-50 text-center mt-1 text-xs text-gray-400">
        ESC
      </div>
    </>
  );
};

export default memo(CloseButton);
