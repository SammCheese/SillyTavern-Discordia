import { lazy, memo, useCallback, useMemo } from 'react';
import { usePage } from '../../providers/pageProvider';
import type { RowComponentProps } from 'react-window';
import { List } from 'react-window';
import { useSearch } from '../../providers/searchProvider';
import ErrorBoundary from '../common/ErrorBoundary/ErrorBoundary';
import { useOpenChat } from '../../hooks/useOpenChat';
import { useSTEvents } from '../../hooks/useSTEvents';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import NewChatButton from './components/NewChatButton';
import ChannelHeaderEntry from './components/ChannelHeaderEntry';
import { useSidebarData } from '../../providers/contentProviders/sidebarStateProvider';
import PlusIcon from './components/PlusIcon';

import { doNewChat, event_types } from '../../st/script';
const Divider = lazy(() => import('../common/Divider/Divider'));
const ChannelEntry = lazy(() => import('./components/ChannelEntry'));
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

const ChannelRow = ({
  index,
  style,
  chats,
  currentChatId,
  onClick,
  isSelectedChat,
}: RowComponentProps & {
  chats: Chat[];
  currentChatId: string | null;
  onClick: (chat: Chat) => void;
  isSelectedChat: (chat: Chat) => boolean;
}) => {
  const chat = chats[index]!;

  const isSelected = useMemo(
    () => currentChatId === chat.file_id || isSelectedChat(chat),
    [chat, currentChatId, isSelectedChat],
  );

  return (
    <div style={style}>
      <ChannelEntry chat={chat} onClick={onClick} isSelected={isSelected} />
    </div>
  );
};

const ChannelBar = () => {
  const { openPage } = usePage();
  const { setSearchQuery } = useSearch();
  const { openChat, isSelectedChat, currentChatId, refreshCurrentChatId } =
    useOpenChat();
  const {
    chats,
    recentChats,
    isLoadingChats,
    setOpen,
    isInitialLoad,
    icons,
    refreshContext,
    context,
  } = useSidebarData();

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
          dislog.log(`No action defined for icon with id: ${id}`);
      }
    },
    [openPage],
  );

  const handleChannelClick = useCallback(
    (chat: Chat) => {
      openChat(chat);
      if (window.innerWidth <= 1000) setOpen(false);
    },
    [openChat, setOpen],
  );

  const handleNewChatClick = useCallback(() => {
    doNewChat();
    if (window.innerWidth <= 1000) setOpen(false);
  }, [setOpen]);

  const iconsFiltered = useMemo(
    () => icons?.filter((i) => !i.showInProfile),
    [icons],
  );

  const handleSearchInput = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery],
  );

  const isInChatContext = useMemo(
    () => context === 'chat' || (isLoadingChats && !isInitialLoad),
    [context, isLoadingChats, isInitialLoad],
  );

  const chatsMemo = useMemo(() => {
    return isInChatContext ? chats : recentChats;
  }, [isInChatContext, chats, recentChats]);

  useSTEvents(
    useMemo(() => {
      const handleChatChange = () => {
        refreshCurrentChatId();
        refreshContext();
      };

      return {
        [event_types.CHAT_CHANGED]: handleChatChange,
        [event_types.CHAT_RENAMED]: handleChatChange,
        [event_types.CHAT_DELETED]: handleChatChange,
        [event_types.CHAT_CREATED]: refreshCurrentChatId,
        [event_types.GROUP_CHAT_DELETED]: handleChatChange,
        [event_types.GROUP_CHAT_CREATED]: refreshCurrentChatId,
      };
    }, [refreshContext, refreshCurrentChatId]),
  );

  const title = useMemo(() => {
    return isInChatContext ? 'Chats' : 'Recent Chats';
  }, [isInChatContext]);

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
                key={icon.id || index}
                onClick={handleToolclick}
              />
            ))}
          </div>
        </div>
        <div id="channel-divider" className="divider"></div>
        <div id="channel-header-title" className="flex flex-row items-center">
          <div className="section-header font-gg-sans-bold grow self-center h-8 py-1">
            {title}
          </div>
          {isInChatContext && (
            <div
              className="flex justify-center p-1 cursor-pointer rounded-md mr-2 hover:bg-base-discordia-lighter transition-colors"
              onClick={handleNewChatClick}
              title="Start a New Chat"
            >
              <PlusIcon />
            </div>
          )}
        </div>
        <div id="channel-list">
          <div id="channels-list-container">
            {/* Skeleton Chats for loading */}
            {isInitialLoad && (
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
            )}

            {chatsMemo.length > 30 ? (
              <List
                rowComponent={ChannelRow}
                rowCount={chatsMemo.length}
                rowHeight={48}
                rowProps={{
                  onClick: handleChannelClick,
                  isSelectedChat,
                  chats: chatsMemo,
                  currentChatId,
                }}
                overscanCount={5}
                style={{ width: '100%' }}
              />
            ) : (
              chatsMemo.map((chat, index) => (
                <ChannelEntry
                  chat={chat}
                  key={chat.file_id || index}
                  onClick={handleChannelClick}
                  isSelected={
                    currentChatId === chat.file_id || isSelectedChat(chat)
                  }
                />
              ))
            )}

            {/* New Chat Button  */}
            {isInChatContext && (
              <div className="flex justify-center px-1">
                <NewChatButton onClick={handleNewChatClick} />
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default memo(ChannelBar);
