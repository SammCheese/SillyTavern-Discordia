import { lazy } from 'react';
import { createPortal } from 'react-dom';
import { rootContainer } from '../index';

const SideBar = lazy(() => import('../components/sidebar/SideBar'));

export const App = () => {
  return createPortal(
    <>
      <SideBar />
    </>,
    rootContainer,
  );
};

export default App;
