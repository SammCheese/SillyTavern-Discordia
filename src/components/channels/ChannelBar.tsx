import React, { lazy, useCallback, useContext, useMemo } from 'react';
import { PageContext } from '../../providers/pageProvider';
import { makeAvatar } from '../../utils/utils';
import type { RowComponentProps } from 'react-window';
import { List } from 'react-window';
import { useSearch } from '../../context/SearchContext';
import ErrorBoundary from '../common/ErrorBoundary/ErrorBoundary';
import { useOpenChat } from '../../hooks/useOpenChat';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

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

interface ChannelBarProps {
  icons: Icon[] | null;
  chats: Chat[];
  setOpen: (value: boolean) => void;
  isLoadingChats?: boolean;
  isInitialLoad?: boolean;
  context: 'recent' | 'chat';
}

const ChannelBar = ({
  icons,
  chats,
  setOpen,
  isLoadingChats = false,
  isInitialLoad = true,
  context,
}: ChannelBarProps) => {
  const { openPage } = useContext(PageContext);
  const { setSearchQuery } = useSearch();
  const { openChat, isSelectedChat } = useOpenChat();

  const handleToolclick = useCallback(
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

  const handleChannelClick = useCallback(
    async (chat: Chat) => {
      await openChat(chat);
      if (window.innerWidth <= 1000) setOpen(false);
    },
    [openChat, setOpen],
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
          isLoading={isLoadingChats}
        />
      </div>
    );
  };

  const handleSearchInput = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery],
  );

  const chatsMemo = useMemo(() => chats, [chats]);

  const shownTitle =
    !isLoadingChats && context !== 'chat' ? ' Recent Chats' : 'Chats';

  return (
    <ErrorBoundary>
      <div id="channel-container" className="px-1 select-none">
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
        <div className="section-header">{shownTitle}</div>
        <div id="channel-list">
          <div id="channels-list-container">
            {isInitialLoad ||
              (isLoadingChats && (
                <SkeletonTheme
                  borderRadius={'8px'}
                  width={'100%'}
                  baseColor="#202025"
                  highlightColor="#444449"
                  enableAnimation={true}
                  duration={1}
                >
                  <Skeleton
                    count={5}
                    height={48}
                    className="mx-auto my-2 w-full"
                  />
                </SkeletonTheme>
              ))}
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
                  isLoading={isLoadingChats}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
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
      className="py-2 px-2.5 select-none cursor-pointer font-bold rounded-md mr-1 w-full flex items-center gap-2 group"
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
