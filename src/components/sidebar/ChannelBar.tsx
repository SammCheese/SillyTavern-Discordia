import React, { lazy } from 'react';
import { PageContext } from '../../providers/pageProvider';
import { makeAvatar, selectCharacter, selectGroup } from '../../utils/utils';

const Divider = React.lazy(() => import('../common/Divider/Divider'));
const MemoizedChannelEntry = lazy(() => import('../channels/ChannelEntry'));
const SearchBar = lazy(() => import('../search/search'));
const ExtensionSettings = lazy(
  () => import('../../pages/settings/extensions/ExtensionSettings'),
);

const { closeCurrentChat, openCharacterChat } = await imports('@script');
const { openGroupChat } = await imports('@scripts/groupChats');

const Channelbar = ({
  title = 'Recent Chats',
  icons,
  chats,
  setOpen,
}: {
  title: string;
  icons: Icon[] | null;
  chats: Chat[];
  setOpen: (value: boolean) => void;
}) => {
  const pageContext = React.useContext(PageContext);

  const handleToolclick = (icon: Icon) => {
    const id = icon.id;
    switch (id) {
      case '#extensions-settings-button':
        pageContext.openPage(<ExtensionSettings />);
        break;
      default:
        console.log(`No action defined for icon with id: ${id}`);
    }
  };

  const isSelectedChat = (chat: Chat): boolean => {
    return SillyTavern.getContext().getCurrentChatId() === chat.file_id;
  };

  const memoizedIsSelectedChat = React.useCallback(isSelectedChat, [
    SillyTavern.getContext().getCurrentChatId(),
  ]);

  const handleChannelClick = async (chat: Chat) => {
    // if its the currently selected chat, do nothing
    if (memoizedIsSelectedChat(chat)) return;

    // Recent Chat handler
    if (chat?.char_id || chat?.is_group) {
      await closeCurrentChat();
      if (chat.is_group) {
        await selectGroup({
          id: chat.group,
          chat_id: chat.file_id,
        });
      } else if (chat.char_id) {
        await selectCharacter(chat.char_id, chat.file_id);
      }
      return;
    }

    // Channel Switch within selected character/group
    const { characterId, groupId } = SillyTavern.getContext();
    if (groupId !== null) {
      await openGroupChat(groupId, chat.file_id);
    } else if (characterId) {
      await openCharacterChat(chat.file_id);
    }

    if (window.innerWidth <= 1000) {
      setOpen(false);
    }
  };

  return (
    <div id="channel-container" className="px-1">
      <SearchBar
        onSearch={(query) => {
          console.log('Search query:', query);
        }}
      />
      <Divider />
      <div id="channel-header">
        <div id="channel-icons-container">
          {icons
            ?.filter((i) => !i.showInProfile)
            .map((icon, index) => (
              <ChannelHeaderEntry
                icon={icon}
                key={index}
                onClick={() => handleToolclick(icon)}
              />
            ))}
        </div>
      </div>
      <div id="channel-divider" className="divider"></div>
      <div className="section-header">{title}</div>
      <div id="channel-list">
        <div id="channels-list-container">
          {chats.map((chat, index) => (
            <div key={index} onClick={() => handleChannelClick(chat)}>
              <MemoizedChannelEntry
                chat={chat}
                isSelected={memoizedIsSelectedChat(chat)}
                avatar={makeAvatar({ chat })}
                setOpen={setOpen}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChannelHeaderEntry = ({
  icon,
  onClick,
}: {
  icon: Icon;
  onClick?: () => void;
}) => {
  return (
    <div
      className="py-2 px-2.5 cursor-pointer font-bold rounded-md mr-1 w-full flex items-center gap-2 group"
      title={icon.title}
      onClick={onClick}
    >
      <div
        style={{ fontSize: '28px' }}
        className={`${icon.className} group-hover:opacity-100`}
      />
      <div className="group-hover:text-white truncate text-gray-500">
        {icon.title}
      </div>
    </div>
  );
};

export default Channelbar;
