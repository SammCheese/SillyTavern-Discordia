import { StrictMode, lazy } from 'react';
import { createRoot } from 'react-dom/client';

import { PageProvider } from './providers/pageProvider';
import ModalProvider from './providers/modalProvider';
import { performPatches } from './patches';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';

const App = lazy(() => import('./App'));

// @ts-expect-error Styles Import
import './styles.css';
// @ts-expect-error Skeleton Styles Import
import 'react-loading-skeleton/dist/skeleton.css';

import ContextMenuProvider from './providers/contextMenuProvider';
import { BackHandlerProvider } from './providers/backHandlerProvider';
import MessageContextMenu from './bridges/MessageContextMenu';
import { PopupProvider } from './providers/popupProvider';
import Compose from './utils/Compose';
import { ExtensionProvider } from './providers/extensionProvider';

window.discordia = window.discordia || {};

// Insert sidebar before top bar
const topBar = document.getElementById('top-bar');

// Create sidebar container
export const rootContainer = document.createElement('div');
rootContainer.id = 'discordia-root';

if (topBar) {
  topBar?.parentNode?.insertBefore(rootContainer, topBar);
  // Unneeded. Remove for the sake of cleaner DOM
  topBar.style.display = 'none';
}

performPatches();

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
const root = createRoot(rootContainer);
root.render(
  <StrictMode>
    <Compose components={providers}>
      <MessageContextMenu />
      <App />
    </Compose>
  </StrictMode>,
);
