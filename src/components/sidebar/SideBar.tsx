import { lazy, useMemo } from 'react';
import ErrorBoundary from '../common/ErrorBoundary/ErrorBoundary';

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
  hasActiveContext: boolean;
}

const SideBar = ({
  open,
  setOpen,
  entities,
  chats,
  icons,
  isLoadingChats,
  hasActiveContext,
}: SideBarProps) => {
  const memoizedEntities = useMemo(() => entities, [entities]);
  const memoizedChats = useMemo(() => chats, [chats]);
  const memoizedIcons = useMemo(() => icons, [icons]);

  return (
    <ErrorBoundary>
      <div
        id="sidebar-container"
        className={`fixed top-0 left-0 h-full z-50 transition-transform duration-150 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div id="server-container">
          <ServerBar entities={memoizedEntities} />
          <ChannelBar
            icons={memoizedIcons}
            chats={memoizedChats}
            setOpen={setOpen}
            isLoadingChats={isLoadingChats}
            hasActiveContext={hasActiveContext}
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
