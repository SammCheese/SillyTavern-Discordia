import React from 'react';

const ProfileMount = React.lazy(() => import('../ProfileMount/ProfileMount'));
const ChannelBar = React.lazy(() => import('../channels/ChannelBar'));
const ServerBar = React.lazy(() => import('../servers/ServerBar'));

interface SideBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  entities: Entity[];
  chats: Chat[];
  icons: Icon[] | null;
  isLoadingChats: boolean;
}

const SideBar = ({
  open,
  setOpen,
  entities,
  chats,
  icons,
  isLoadingChats,
}: SideBarProps) => {
  const memoizedEntities = React.useMemo(() => entities, [entities]);
  const memoizedChats = React.useMemo(() => chats, [chats]);
  const memoizedIcons = React.useMemo(() => icons, [icons]);

  return (
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
        />
      </div>
      <div id="user-container">
        <ProfileMount icons={memoizedIcons} />
      </div>
    </div>
  );
};

export default SideBar;
