import { StrictMode, lazy } from 'react';
import { createRoot } from 'react-dom/client';

import { PageProvider } from './providers/pageProvider';
import ModalProvider from './providers/modalProvider';
import { performPatches } from './patches';

const App = lazy(() => import('./App'));

// @ts-expect-error Styles Import
import './styles.css';
import ContextMenuProvider from './providers/contextMenuProvider';

// Insert sidebar before top bar
const topBar = document.getElementById('top-bar');

// Create sidebar container
export const rootContainer = document.createElement('div');
rootContainer.id = 'discordia-root';
topBar?.parentNode?.insertBefore(rootContainer, topBar);
// Unneeded. Remove for the same of cleaner DOM
topBar?.remove();

performPatches();

// Create React root
const root = createRoot(rootContainer);
root.render(
  <StrictMode>
    <PageProvider>
      <ModalProvider>
        <ContextMenuProvider>
          <App />
        </ContextMenuProvider>
      </ModalProvider>
    </PageProvider>
  </StrictMode>,
);
