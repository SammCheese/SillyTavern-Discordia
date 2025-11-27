import React from 'react';
import ReactDOM from 'react-dom/client';
import { PageProvider } from './providers/pageProvider';

const SideBar = React.lazy(() => import('./components/sidebar/SideBar'));

// @ts-expect-error Styles Import
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
root.render(
  <React.StrictMode>
    <PageProvider>
      <SideBar />
    </PageProvider>
  </React.StrictMode>,
);

// Overrides
const rightSendForm = $('#rightSendForm');
const leftSendForm = $('#leftSendForm');

// Angle Submit button
if (rightSendForm) {
  const send_button = rightSendForm.find('#send_but');
  send_button.addClass('fa-rotate-by');
  send_button.attr('style', '--fa-rotate-angle: 45deg');
}

// Group Both Icons into one
if (leftSendForm) {
  leftSendForm.empty();
  const extrasMenu = $(`
    <div id="extras_menu_button" class="fa-solid fa-plus">
      <div id="options_button" class="extras-menu-content">
      </div>
      <div id="extensionsMenuButton">
      </div>
    </div>
    `);
  leftSendForm.append(extrasMenu);
}
