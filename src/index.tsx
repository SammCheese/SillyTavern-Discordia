import React from 'react';
import ReactDOM from 'react-dom/client';
import { PageProvider } from './providers/pageProvider';

const SideBar = React.lazy(() => import('./components/sidebar/SideBar'));

// @ts-ignore
import './styles.css';


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
    <PageProvider>
      <SideBar />
    </PageProvider>
</React.StrictMode>);
