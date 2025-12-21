import { lazy, useCallback, useMemo } from 'react';
import ErrorBoundary from '../common/ErrorBoundary/ErrorBoundary';
import { useBackHandler } from '../../hooks/useBackHandler';

const ProfileMount = lazy(() => import('../ProfileMount/ProfileMount'));
const ChannelBar = lazy(() => import('../channels/ChannelBar'));
const ServerBar = lazy(() => import('../servers/ServerBar'));

interface SideBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  entities: Entity[];
  chats: Chat[];
  icons: Icon[] | null;
  isLoadingChats: boolean;
  isInitialLoad: boolean;
}

const SideBar = ({
  open,
  setOpen,
  entities,
  chats,
  icons,
  isLoadingChats,
  isInitialLoad,
}: SideBarProps) => {
  const memoizedEntities = useMemo(() => entities, [entities]);
  const memoizedChats = useMemo(() => chats, [chats]);
  const memoizedIcons = useMemo(() => icons, [icons]);
  const memoizedIsLoadingChats = useMemo(
    () => isLoadingChats,
    [isLoadingChats],
  );
  const memoizedIsInitialLoad = useMemo(() => isInitialLoad, [isInitialLoad]);
  const memoizedSetOpen = useMemo(() => setOpen, [setOpen]);

  const handleBack = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useBackHandler(open, handleBack, 200);

  return (
    <ErrorBoundary>
      <div
        id="sidebar-container"
        className={`fixed top-0 left-0 h-full z-50 transition-transform duration-150 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div id="server-container">
          <ServerBar
            entities={memoizedEntities}
            isInitialLoad={memoizedIsInitialLoad}
          />
          <ChannelBar
            icons={memoizedIcons}
            chats={memoizedChats}
            setOpen={memoizedSetOpen}
            isLoadingChats={memoizedIsLoadingChats}
            isInitialLoad={memoizedIsInitialLoad}
          />
        </div>
        <div id="user-container">
          <ProfileMount icons={memoizedIcons} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SideBar;
