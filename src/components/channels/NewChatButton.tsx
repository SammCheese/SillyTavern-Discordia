import { memo, useCallback } from 'react';

interface NewChatButtonProps {
  onClick: () => void;
}

const NewChatButton = ({ onClick }: NewChatButtonProps) => {
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <button
      className="w-full my-2 outline-dashed outline-1 cursor-pointer outline-gray-600 h-12 flex items-center justify-center rounded-md bg-discordia hover:bg-base-discordia-lighter  transition-colors"
      onClick={handleClick}
      title="Start a New Chat"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  );
};

export default memo(NewChatButton);
