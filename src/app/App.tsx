import { lazy, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSidebarState } from '../hooks/useSidebarState';
import { rootContainer } from '../index';

const SideBar = lazy(() => import('../components/sidebar/SideBar'));

export const App = () => {
  const sidebarState = useSidebarState();

  const memoizedSidebarState = useMemo(
    () => sidebarState,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      sidebarState.open,
      sidebarState.setOpen,
      sidebarState.entities,
      sidebarState.chats,
      sidebarState.icons,
      sidebarState.isLoadingChats,
      sidebarState.isInitialLoad,
    ],
  );

  return createPortal(
    <>
      <SideBar {...memoizedSidebarState} />
    </>,
    rootContainer,
  );
};

export default App;
