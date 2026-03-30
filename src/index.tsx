import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { performPatches, unpatchAll } from './patches';

import './styles.css';
import 'react-loading-skeleton/dist/skeleton.css';

import PageProvider from './providers/pageProvider';
import ModalProvider from './providers/modalProvider';
import PopupProvider from './providers/popupProvider';
import MessageContextMenu from './bridges/MessageContextMenu';
import ContextMenuProvider from './providers/contextMenuProvider';
import BackHandlerProvider from './providers/backHandlerProvider';
import SearchProvider from './providers/searchProvider';
import ExtensionProvider from './providers/contentProviders/extensionProvider';
import PersonaProvider from './providers/contentProviders/personaProvider';

import Compose from './app/Compose';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';

import App from './app/App';

let failedStart = false;

window.discordia = window.discordia || {
  extensionTemplates: [],
  backups: {},
};

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

const startApp = (safeStart: boolean = false) => {
  let root: Root | null = null;

  try {
    // Insert sidebar before top bar
    const topBar = document.getElementById('top-bar');

    if (topBar) {
      topBar?.parentNode?.insertBefore(rootContainer, topBar);
      // Unneeded. Remove for the sake of cleaner DOM
      topBar.style.display = 'none';
    }

    if (!safeStart && !isRemounting) {
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
      PersonaProvider,
      // UI Providers
      PopupProvider,
      PageProvider,
      ModalProvider,
      ContextMenuProvider,
      SearchProvider,
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
    failedStart = true;
    console.error('Error starting Discordia:', error);

    if (root) {
      root.unmount();
    }

    if (failedStart && !safeStart) {
      toastr.warning(
        'Failed to start Discordia. Retrying in safe mode...',
        'Discordia Startup',
        {
          timeOut: 5000,
        },
      );
      unpatchAll();
      startApp(true);
    } else {
      toastr.error(
        'Failed to start Discordia. Please check the console for details.',
        'Discordia Startup',
        {
          timeOut: 5000,
        },
      );
    }
  }
};

startApp();

export default startApp;
