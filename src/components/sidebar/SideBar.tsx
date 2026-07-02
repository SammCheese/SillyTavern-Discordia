import { lazy, memo, useCallback } from 'react';
import { useBackHandler } from '../../hooks/useBackHandler';
import {
  useSidebarData,
  useSidebarUi,
} from '../../providers/contentProviders/sidebarStateProvider';
import PersonaProvider from '../../providers/contentProviders/personaProvider';

const ProfileMount = lazy(() => import('../ProfileMount/ProfileMount'));
const ChannelBar = lazy(() => import('../channels/ChannelBar'));
const ServerBar = lazy(() => import('../servers/ServerBar'));

const SideBar = () => {
  const { open, setOpen } = useSidebarUi();
  const { icons } = useSidebarData();
  const handleBack = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useBackHandler(open, handleBack, 200);

  return (
    <div
      id="sidebar-container"
      className={`fixed top-0 left-0 h-full z-50 transition-transform duration-150 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div id="server-container">
        <ServerBar />
        <ChannelBar />
      </div>
      <div id="user-container">
        <PersonaProvider>
          <ProfileMount icons={icons} />
        </PersonaProvider>
      </div>
    </div>
  );
};

export default memo(SideBar);
