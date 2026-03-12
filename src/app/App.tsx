import { lazy } from 'react';
import { createPortal } from 'react-dom';
import { rootContainer } from '../index';
import { useSidebarState } from '../hooks/useSidebarState';

const SideBar = lazy(() => import('../components/sidebar/SideBar'));

export const App = () => {
  const state = useSidebarState();

  return createPortal(
    <>
      <SideBar {...state} />
    </>,
    rootContainer,
  );
};

export default App;
