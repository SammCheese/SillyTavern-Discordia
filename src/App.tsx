import React from 'react';
import { createPortal } from 'react-dom';
import { useSidebarState } from './hooks/useSidebarState';
import { SearchProvider } from './context/SearchContext';

import { rootContainer } from './index';

const SideBar = React.lazy(() => import('./components/sidebar/SideBar'));

export const App = () => {
  const { open, setOpen, entities, chats, icons, isLoadingChats } =
    useSidebarState();

  return createPortal(
    <SearchProvider>
      <SideBar
        open={open}
        setOpen={setOpen}
        entities={entities}
        chats={chats}
        icons={icons}
        isLoadingChats={isLoadingChats}
      />
    </SearchProvider>,
    rootContainer,
  );
};

export default App;
