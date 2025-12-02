import React, { lazy } from 'react';
import { PageContext } from '../../providers/pageProvider';
import { makeAvatar, selectCharacter, selectGroup } from '../../utils/utils';
import type { RowComponentProps } from 'react-window';
import { List } from 'react-window';

const Divider = React.lazy(() => import('../common/Divider/Divider'));
const ChannelEntry = lazy(() => import('./ChannelEntry'));
const SearchBar = lazy(() => import('../common/search/search'));

const ExtensionSettings = lazy(
  () => import('../../pages/settings/extensions/ExtensionSettings'),
);
const WorldInfoSettings = lazy(
  () => import('../../pages/settings/worldinfo/WorldInfoSettings'),
);
const AppearanceSettings = lazy(
  () => import('../../pages/settings/appearance/AppearanceSettings'),
);
const PersonaSettings = lazy(
  () => import('../../pages/settings/persona/PersonaSettings'),
);
const CharacterSettings = lazy(
  () => import('../../pages/settings/character/CharacterSettings'),
);
const FormattingSettings = lazy(
  () => import('../../pages/settings/formatting/FormattingSettings'),
);

const { closeCurrentChat, openCharacterChat } = await imports('@script');
const { openGroupChat } = await imports('@scripts/groupChats');

const ChannelBar = ({
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
  const { openPage } = React.useContext(PageContext);

  const handleToolclick = React.useCallback(
    (icon: Icon) => {
      const id = icon.id;
      switch (id) {
        case '#advanced-formatting-button':
          openPage(<FormattingSettings />);
          break;
        case '#extensions-settings-button':
          openPage(<ExtensionSettings />);
          break;
        case '#WI-SP-button':
          openPage(<WorldInfoSettings />);
          break;
        case '#backgrounds-button':
          openPage(<AppearanceSettings />);
          break;
        case '#persona-management-button':
          openPage(<PersonaSettings />);
          break;
        case '#rightNavHolder':
          openPage(<CharacterSettings />);
          break;
        default:
          console.log(`No action defined for icon with id: ${id}`);
      }
    },
    [openPage],
  );

  const isSelectedChat = React.useCallback(
    (chat: Chat): boolean => {
      return SillyTavern.getContext().getCurrentChatId() === chat.file_id;
    },
    [SillyTavern.getContext().getCurrentChatId()],
  );

  const handleChannelClick = React.useCallback(
    async (chat: Chat) => {
      if (!chat) return;
      // if its the currently selected chat, do nothing
      if (isSelectedChat(chat)) return;

      // Recent Chat handler
      if (
        (chat?.char_id !== undefined && chat?.char_id >= 0) ||
        chat?.is_group
      ) {
        await closeCurrentChat();
        if (chat.is_group) {
          await selectGroup({
            id: chat.group,
            chat_id: chat.file_id,
          });
        } else if (chat?.char_id !== undefined) {
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
    },
    [setOpen, isSelectedChat],
  );

  const iconsFiltered = React.useMemo(
    () => icons?.filter((i) => !i.showInProfile),
    [icons],
  );

  const Row = ({ index, style }: RowComponentProps) => {
    const chat = chats[index]!;

    return (
      <div style={style}>
        <ChannelEntry
          chat={chat}
          onClick={handleChannelClick}
          isSelected={isSelectedChat(chat)}
          avatar={makeAvatar({ chat })}
          setOpen={setOpen}
        />
      </div>
    );
  };

  const handleSearchInput = React.useCallback((query: string) => {
    console.log('Search query:', query);
  }, []);

  const chatsMemo = React.useMemo(() => chats, [chats]);

  return (
    <div id="channel-container" className="px-1">
      <SearchBar onInput={handleSearchInput} />
      <Divider />
      <div id="channel-header">
        <div id="channel-icons-container">
          {iconsFiltered?.map((icon, index) => (
            <ChannelHeaderEntry
              icon={icon}
              key={index}
              onClick={handleToolclick}
            />
          ))}
        </div>
      </div>
      <div id="channel-divider" className="divider"></div>
      <div className="section-header">{title}</div>
      <div id="channel-list">
        <div id="channels-list-container">
          {chatsMemo.length > 50 ? (
            <List
              rowComponent={Row}
              rowCount={chatsMemo.length}
              rowHeight={48}
              rowProps={{}}
              overscanCount={5}
              style={{ width: '100%' }}
            />
          ) : (
            chatsMemo.map((chat, index) => (
              <ChannelEntry
                chat={chat}
                key={index}
                onClick={handleChannelClick}
                isSelected={isSelectedChat(chat)}
                avatar={makeAvatar({ chat })}
                setOpen={setOpen}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ChannelHeaderEntry = React.memo(function ChannelHeaderEntry({
  icon,
  onClick,
}: {
  icon: Icon;
  onClick?: (icon: Icon) => void;
}) {
  const handleClick = () => {
    if (onClick) {
      onClick(icon);
    }
  };

  return (
    <div
      className="py-2 px-2.5 cursor-pointer font-bold rounded-md mr-1 w-full flex items-center gap-2 group"
      title={icon.title}
      onClick={handleClick}
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
});

export default React.memo(ChannelBar);
