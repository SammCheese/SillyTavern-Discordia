import React from 'react';
import ReactDOM from 'react-dom/client';
import SideBar from './components/sidebar/SideBar';
import { PageProvider } from './providers/pageProvider';

// @ts-ignore
import './styles.css';
import { CharProvider } from './providers/charProvider';

// Insert sidebar before top bar
const topBar = document.getElementById('top-bar');

// Create sidebar container
export const rootContainer = document.createElement('div');
rootContainer.id = 'discordia-root';
topBar?.parentNode?.insertBefore(rootContainer, topBar);
topBar?.remove();



// Create React root
const root = ReactDOM.createRoot(rootContainer);
root.render(<React.StrictMode>
  <CharProvider>
    <PageProvider>
      <SideBar />
    </PageProvider>
  </CharProvider>
</React.StrictMode>);
