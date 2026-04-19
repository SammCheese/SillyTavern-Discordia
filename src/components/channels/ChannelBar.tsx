import { lazy, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { usePage } from '../../providers/pageProvider';
import { makeAvatar } from '../../utils/utils';
import type { RowComponentProps } from 'react-window';
import { List } from 'react-window';
import { useSearch } from '../../providers/searchProvider';
import ErrorBoundary from '../common/ErrorBoundary/ErrorBoundary';
import { useOpenChat } from '../../hooks/useOpenChat';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import NewChatButton from './NewChatButton';
import ChannelHeaderEntry from './ChannelHeaderEntry';
import { useSidebar } from '../../providers/contentProviders/sidebarStateProvider';

const Divider = lazy(() => import('../common/Divider/Divider'));
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

const { doNewChat, eventSource, event_types } = await imports('@script');

const ChannelRow = ({
  index,
  style,
  chats,
  currentChatId,
  onClick,
  isSelectedChat,
  makeAvatar,
}: RowComponentProps & {
  chats: Chat[];
  currentChatId: string | null;
  onClick: (chat: Chat) => void;
  isSelectedChat: (chat: Chat) => boolean;
  makeAvatar: (props: { chat: Chat }) => string;
}) => {
  const chat = chats[index]!;

  const isSelected = useMemo(
    () =>
      currentChatId === (chat.file_id ?? chat.file_name) ||
      isSelectedChat(chat),
    [chat, currentChatId, isSelectedChat],
  );
  const avatar = useMemo(() => makeAvatar({ chat }), [chat, makeAvatar]);

  return (
    <div style={style}>
      <ChannelEntry
        chat={chat}
        onClick={onClick}
        isSelected={isSelected}
        avatar={avatar}
      />
    </div>
  );
};

const ChannelBar = () => {
  const [context, setContext] = useState('recent');
  const { openPage } = usePage();
  const { setSearchQuery } = useSearch();
  const { openChat, isSelectedChat, currentChatId, setCurrentChatId } =
    useOpenChat();
  const { chats, recentChats, isLoadingChats, setOpen, isInitialLoad, icons } =
    useSidebar();

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

  const iconsFiltered = icons?.filter((i) => !i.showInProfile);

  const handleSearchInput = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery],
  );

  const chatsMemo = useMemo(() => {
    return context === 'recent' ? recentChats : chats;
  }, [chats, recentChats, context]);

  useEffect(() => {
    const handleChatChange = () => {
      const { characterId, groupId } = SillyTavern.getContext();
      if (typeof characterId !== 'undefined' || groupId !== null) {
        setContext('chat');
      } else {
        setContext('recent');
        setCurrentChatId(null);
      }
    };
    eventSource.on(event_types.CHAT_CHANGED, handleChatChange);

    return () => {
      eventSource.removeListener(event_types.CHAT_CHANGED, handleChatChange);
    };
  }, [setCurrentChatId]);

  const title = context === 'recent' ? 'Recent Chats' : 'Chats';

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
        <div className="section-header">{title}</div>
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
                  makeAvatar,
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
                    currentChatId === (chat.file_id ?? chat.file_name) ||
                    isSelectedChat(chat)
                  }
                  avatar={makeAvatar({ chat })}
                />
              ))
            )}

            {/* New Chat Button  */}
            {!isLoadingChats && context === 'chat' && (
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
