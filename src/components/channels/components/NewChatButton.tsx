import { memo, useCallback } from 'react';
import PlusIcon from './PlusIcon';

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
      <PlusIcon />
    </button>
  );
};

export default memo(NewChatButton);
