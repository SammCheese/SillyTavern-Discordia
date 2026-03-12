import { lazy, memo, useCallback } from 'react';
import ErrorBoundary from '../common/ErrorBoundary/ErrorBoundary';
import { useBackHandler } from '../../hooks/useBackHandler';

const ProfileMount = lazy(() => import('../ProfileMount/ProfileMount'));
const ChannelBar = lazy(() => import('../channels/ChannelBar'));
const ServerBar = lazy(() => import('../servers/ServerBar'));

interface SideBarProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  entities: Entity[];
  chats: Chat[];
  recentChats: Chat[];
  icons: Icon[] | null;
  isLoadingChats?: boolean;
  isInitialLoad?: boolean;
}

const SideBar = ({ ...state }: SideBarProps) => {
  const handleBack = useCallback(() => {
    state.setOpen(false);
  }, [state]);

  useBackHandler(state.open, handleBack, 200);

  return (
    <ErrorBoundary>
      <div
        id="sidebar-container"
        className={`fixed top-0 left-0 h-full z-50 transition-transform duration-150 ease-in-out ${
          state.open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div id="server-container">
          <ServerBar
            entities={state.entities}
            isInitialLoad={state.isInitialLoad}
          />
          <ChannelBar
            recentChats={state.recentChats}
            icons={state.icons}
            chats={state.chats}
            setOpen={state.setOpen}
            isLoadingChats={state.isLoadingChats}
            isInitialLoad={state.isInitialLoad}
          />
        </div>
        <div id="user-container">
          <ProfileMount icons={state.icons} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default memo(SideBar);
