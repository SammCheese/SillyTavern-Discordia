import { lazy } from 'react';
import { createPortal } from 'react-dom';
import { rootContainer } from '../index';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';

const SideBar = lazy(() => import('../components/sidebar/SideBar'));

export const App = () => {
  return createPortal(
    <>
      <ErrorBoundary>
        <SideBar />
      </ErrorBoundary>
    </>,
    rootContainer,
  );
};

export default App;
