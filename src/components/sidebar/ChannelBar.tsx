import React, { lazy } from 'react';
import { PageContext } from '../../providers/pageProvider';

const Divider = React.lazy(() => import('../common/Divider/Divider'));
const MemoizedChannelEntry = lazy(() => import('../channels/ChannelEntry'));
const SearchBar = lazy(() => import('../search/search'));
const ExtensionSettings = lazy(
  () => import('../../pages/settings/extensions/ExtensionSettings'),
);

const { getThumbnailUrl } = await imports('@script');

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

  const makeAvatar = (chat?: Chat) => {
    if (chat && chat?.avatar) {
      return getThumbnailUrl('avatar', chat?.avatar ?? 'ai4.png');
    }
    const { groupId, characterId } = SillyTavern.getContext();

    if (groupId !== null && typeof groupId !== 'undefined') {
      const group = SillyTavern.getContext().groups.find(
        (g) => g.id.toString() === groupId.toString(),
      );
      return group.avatar_url;
    }

    const charIdNum =
      typeof characterId === 'string'
        ? parseInt(characterId)
        : (characterId ?? -1);
    const character = SillyTavern.getContext().characters[charIdNum];
    return getThumbnailUrl('avatar', character ? character.avatar : 'ai4.png');
  };

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
            <MemoizedChannelEntry
              key={index}
              chat={chat}
              isSelected={false}
              onSelect={() => {
                console.log('Channel selected:', chat);
              }}
              avatar={makeAvatar(chat)}
              setOpen={setOpen}
            />
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
