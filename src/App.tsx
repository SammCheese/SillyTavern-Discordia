import React from 'react';
import { createPortal } from 'react-dom';
import { useSidebarState } from './hooks/useSidebarState';

import { rootContainer } from './index';

const SideBar = React.lazy(() => import('./components/sidebar/SideBar'));

const CHANNEL_MENU_CONFIG = [
  { name: 'Backgrounds', id: '#backgrounds-button' },
  { name: 'Persona Management', id: '#persona-management-button' },
  { name: 'Character Selector', id: '#rightNavHolder' },
  { name: 'Extensions Settings', id: '#extensions-settings-button' },
  { name: 'Advanced Formatting', id: '#advanced-formatting-button' },
  { name: 'World Info', id: '#WI-SP-button' },
];

export const App = () => {
  const { open, setOpen, entities, chats, icons } =
    useSidebarState(CHANNEL_MENU_CONFIG);

  return createPortal(
    <SideBar
      open={open}
      setOpen={setOpen}
      entities={entities}
      chats={chats}
      icons={icons}
    />,
    rootContainer,
  );
};

export default App;
