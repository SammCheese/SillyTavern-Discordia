import { lazy, memo, useCallback } from 'react';
import ErrorBoundary from '../common/ErrorBoundary/ErrorBoundary';
import { useBackHandler } from '../../hooks/useBackHandler';
import { useSidebar } from '../../providers/contentProviders/sidebarStateProvider';

const ProfileMount = lazy(() => import('../ProfileMount/ProfileMount'));
const ChannelBar = lazy(() => import('../channels/ChannelBar'));
const ServerBar = lazy(() => import('../servers/ServerBar'));

const SideBar = () => {
  const state = useSidebar();
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
          <ServerBar />
          <ChannelBar />
        </div>
        <div id="user-container">
          <ProfileMount icons={state.icons} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default memo(SideBar);
