import React from 'react';

const ChannelEntry = ({
  avatar,
  chat,
  isSelected,
}: {
  avatar: string;
  chat: Chat;
  isSelected: boolean;
  onSelect?: (id?: string) => void;
  setOpen: (value: boolean) => void;
}) => {
  return (
    <li
      className={`border-none relative ms-1 cursor-pointer rounded-lg hover:bg-lighter ${isSelected ? 'bg-lighter' : ''}`}
      id={`recent-chat-${chat.file_id}`}
      title={chat.file_id}
    >
      <div className="items-stretch flex w-full box-border">
        <div
          style={{ flex: '1 1 auto', paddingRight: '8px', paddingLeft: '8px' }}
          className="items-center flex gap-2 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap w-full"
        >
          <div className="h-12 items-center flex rounded-sm min-w-0 p-0">
            <img
              loading="lazy"
              style={{ flex: '0 0 auto' }}
              className="rounded-4xl h-9 w-9 object-cover flex me-3 justify-center"
              src={avatar}
            />
            <div className="truncate">{chat?.file_id ?? chat.file_name}</div>
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
      </div>
    </li>
  );
};

const MemoizedChannelEntry = React.memo(ChannelEntry);

export default MemoizedChannelEntry;
