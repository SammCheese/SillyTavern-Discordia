
import React, { lazy }from "react";

import { PageContext } from "../../providers/pageProvider";

const Divider = React.lazy(() => import("../Divider/Divider"));
const ChannelEntry = lazy(() => import('../channels/ChannelEntry'));
const SearchBar = lazy(() => import('../search/search'));
const ExtensionSettings = lazy(() => import('../../pages/settings/extensions/ExtensionSettings'));

const { getThumbnailUrl } = await imports('@script');

const Channelbar = ({ title = "Recent Chats", icons, chats, setOpen }: { title: string, icons: Icon[] | null, chats: any[], setOpen: (value: boolean) => void }) => {
  const pageContext = React.useContext(PageContext);


  const makeAvatar = (chat?: any ) => {
    if (chat && chat?.avatar) {
      return getThumbnailUrl('avatar', chat?.avatar ?? 'ai4.png');
    };
    const { groupId, characterId } = SillyTavern.getContext();

    if (groupId !== null && typeof groupId !== 'undefined') {
      const group = SillyTavern.getContext().groups.find((g) => g.id.toString() === groupId.toString());
      return group.avatar_url;
    }

    const charIdNum =
      typeof characterId === 'string'
        ? parseInt(characterId)
        : characterId ?? -1;
    const character = SillyTavern.getContext().characters[charIdNum];
    return getThumbnailUrl('avatar', character ? character.avatar : 'ai4.png');
  }

  const handleToolclick = (icon: Icon) => {
    const id = icon.id;
    switch (id) {
      case "#extensions-settings-button":
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
              <div
                className="discord-channel-header"
                title={icon.title}
                key={index}
                onClick={() => handleToolclick(icon)}
              >
                <div className={icon.className} />
                <div>{icon.title}</div>
              </div>
            ))}
        </div>
      </div>
      <div id="channel-divider" className="divider"></div>
      <div className="section-header">{title}</div>
      <div id="channel-list">
        <div id="channels-list-container">
          {chats.map((chat, index) => (
            <ChannelEntry
              key={index}
              channel={chat}
              isSelected={false}
              onSelect={() => {
                console.log('Channel selected:', chat);

              }}
              avatar={
                makeAvatar(chat)
              }
              setOpen={setOpen}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Channelbar;
