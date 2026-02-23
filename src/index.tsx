import { StrictMode, lazy } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { performPatches } from './patches';

// @ts-expect-error Styles Import
import './styles.css';
// @ts-expect-error Skeleton Styles Import
import 'react-loading-skeleton/dist/skeleton.css';

import PageProvider from './providers/pageProvider';
import ModalProvider from './providers/modalProvider';
import PopupProvider from './providers/popupProvider';
import ExtensionProvider from './providers/extensionProvider';
import MessageContextMenu from './bridges/MessageContextMenu';
import ContextMenuProvider from './providers/contextMenuProvider';
import BackHandlerProvider from './providers/backHandlerProvider';

import Compose from './app/Compose';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';

const App = lazy(() => import('./app/App'));

window.discordia = window.discordia || {};

export let rootContainer = document.getElementById(
  'discordia-root',
) as HTMLDivElement;
let isRemounting = false;

if (rootContainer) {
  rootContainer.remove();
  // The root container is already there, that can only happen if we're doing a hotreload
  isRemounting = true;
}

rootContainer = document.createElement('div');
rootContainer.id = 'discordia-root';

const startApp = () => {
  let root: Root | null = null;

  try {
    // Insert sidebar before top bar
    const topBar = document.getElementById('top-bar');

    if (topBar) {
      topBar?.parentNode?.insertBefore(rootContainer, topBar);
      // Unneeded. Remove for the sake of cleaner DOM
      topBar.style.display = 'none';
    }

    if (!isRemounting) {
      performPatches();
    }

    // Compose all providers
    const providers = [
      // Necessary Evil
      ErrorBoundary,
      // Functionality Provider
      BackHandlerProvider,
      // Data Providers
      ExtensionProvider,
      // UI Providers
      PopupProvider,
      PageProvider,
      ModalProvider,
      ContextMenuProvider,
    ];

    // Create React root
    root = createRoot(rootContainer);
    root.render(
      <StrictMode>
        <Compose components={providers}>
          <MessageContextMenu />
          <App />
        </Compose>
      </StrictMode>,
    );
  } catch (error) {
    console.error('Error starting Discordia:', error);
    // @ts-expect-error toastr is a global variable
    toastr.error(
      'Failed to start Discordia. Please check the console for details.',
      {
        timeOut: 5000,
      },
    );
    if (root) {
      root.unmount();
    }
  }
};

startApp();
