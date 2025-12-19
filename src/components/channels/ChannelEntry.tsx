import { useContext, memo, useCallback } from 'react';
import Skeleton from 'react-loading-skeleton';
import { ContextMenuContext } from '../../providers/contextMenuProvider';

interface ChannelEntryProps {
  avatar: string;
  chat: Chat;
  isSelected: boolean;
  onClick?: (chat: Chat) => void;
  isLoading?: boolean;
}

const { deleteCharacterChatByName } = await imports('@script');

const ChannelEntry = ({
  avatar,
  chat,
  isSelected,
  onClick,
  isLoading = false,
}: ChannelEntryProps) => {
  const { showContextMenu } = useContext(ContextMenuContext);

  const handleClick = useCallback(() => {
    onClick?.(chat);
  }, [onClick, chat]);

  const handleDelete = useCallback(async () => {
    try {
      let charId = chat.char_id ?? null;
      if (!charId) {
        charId = SillyTavern.getContext().characters.findIndex(
          (c) => c.avatar === chat.avatar,
        );
      }
      if (charId === null || charId === -1) return;

      await deleteCharacterChatByName(charId.toString(), chat.file_id);
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }, [chat]);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    showContextMenu(e, [
      {
        label: 'Open',
        onClick: handleClick,
      },
      /*{
        label: 'Export',
        onClick: () => {
          console.log('Export channel:', chat.file_id);
        },
      },*/
      {
        label: '---',
        variant: 'separator',
      },
      {
        label: 'Delete',
        variant: 'danger',
        onClick: handleDelete,
      },
    ]);
  };

  return (
    <li
      className={`border-none relative ms-1 select-none cursor-pointer rounded-lg hover:bg-lighter ${isSelected ? 'bg-lighter' : ''}`}
      id={`recent-chat-${chat.file_id}`}
      title={chat.file_id}
      onClick={handleClick}
      onContextMenu={handleRightClick}
    >
      <div className="items-stretch flex w-full box-border">
        {isLoading ? (
          <div
            style={{ flex: '1 1 auto', padding: '8px' }}
            className="w-full flex flex-col gap-2 h-12 "
          >
            <Skeleton className="h-9 mr-2 rounded-4xl bg-gray-600" />
            <Skeleton className="w-full rounded-xl bg-gray-600" />
          </div>
        ) : (
          <>
            <div
              style={{
                flex: '1 1 auto',
                paddingRight: '8px',
                paddingLeft: '8px',
              }}
              className="items-center flex gap-2 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap w-full"
            >
              <div className="h-12 items-center flex rounded-sm min-w-0 p-0">
                <img
                  loading="lazy"
                  style={{ flex: '0 0 auto' }}
                  className="rounded-4xl h-9 w-9 object-cover flex me-3 justify-center"
                  src={avatar}
                />
                <div className="truncate select-none">
                  {chat?.file_id ?? chat.file_name}
                </div>
              </div>
            </div>
            <div className="items-center flex flex-row shrink-0 justify-end box-border ps-px-[16px]">
              <div
                className="self-center p-0 m-0 hidden me-2 pe-2.5"
                id="close-chat-button"
              >
                x
              </div>
            </div>
          </>
        )}
      </div>
    </li>
  );
};

export default memo(ChannelEntry);
