import React from "react";

const { selectCharacterById, openCharacterChat } = await imports('@script');


const ChannelEntry = (
  { avatar, channel, isSelected, onSelect, setOpen }:
  { avatar: string; channel: any; isSelected: boolean; onSelect?: (id: string) => void; setOpen: (value: boolean) => void }
) => {


  const handleClick = async () => {
    if (isSelected) return;
    if (channel.char_id === undefined) return;
    if (SillyTavern.getContext().getCurrentChatId() === channel.file_id) return;

    await selectCharacterById(channel.char_id);
    await openCharacterChat(channel.file_id);
    onSelect?.(channel.file_id);
    if (window.innerWidth <= 1000) {
      setOpen(false);
    }
  };

  return (
    <li
      className="border-none relative ms-1 cursor-pointer rounded-lg hover:bg-lighter"
      id={`recent-chat-${channel.file_id}`}
      title={channel.file_id}
    >
      <div className="items-stretch flex w-full box-border">
        <div
          style={{ flex: '1 1 auto', paddingRight: '8px', paddingLeft: '8px' }}
          className="items-center flex gap-2 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap w-full"
          onClick={() => handleClick()}
        >
          <div className="h-12 items-center flex rounded-sm min-w-0 p-0">
            <img
              style={{ flex: "0 0 auto"}}
              className="rounded-4xl h-9 w-9 object-cover flex me-3 justify-center"
              src={
                avatar
              }
            />
            <div className="truncate">{channel?.file_id ?? channel.file_name}</div>
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
}

export default ChannelEntry;
