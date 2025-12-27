import { lazy, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSidebarState } from './hooks/useSidebarState';
import { SearchProvider } from './providers/searchProvider';

import { rootContainer } from './index';

const SideBar = lazy(() => import('./components/sidebar/SideBar'));

export const App = () => {
  const sidebarState = useSidebarState();

  const memoizedSidebarState = useMemo(
    () => sidebarState,
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
    <SearchProvider>
      <SideBar {...memoizedSidebarState} />
    </SearchProvider>,
    rootContainer,
  );
};

export default App;
