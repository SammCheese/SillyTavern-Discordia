import React from 'react';
import ReactDOM from 'react-dom/client';
import { PageProvider } from './providers/pageProvider';

const App = React.lazy(() => import('./App'));

const { main_api } = await imports('@script');

// @ts-expect-error Styles Import
import './styles.css';

// Initialize My window prop
window.discordia = {
  main_api: main_api,
};

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
      <App />
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
  const extensionsMenu = $('#extensionsMenu').addClass('font-family-reset');
  const optionsMenu = $('#options').addClass('font-family-reset');

  const extrasMenu = $(`
    <div id="extras_menu_button" class="fa-solid fa-plus">
      <div id="unified_extras_menu" class="extras_menu_dropdown">
      </div>
    </div>
    `);

  extrasMenu.find('#unified_extras_menu').append(optionsMenu, extensionsMenu);

  extrasMenu.on('click', () => {
    if (extensionsMenu.is(':visible') || optionsMenu.is(':visible')) {
      window.removeEventListener('click', handleExtraListener);
      extensionsMenu.hide();
      optionsMenu.hide();
      return;
    }

    window.addEventListener('click', handleExtraListener);
    $('#extensionsMenu').show();
    $('#options').show();
  });
  leftSendForm.empty();
  leftSendForm.append(extrasMenu);
}

function handleExtraListener(event: MouseEvent) {
  const extensionsMenu = $('#extensionsMenu');
  const optionsMenu = $('#options');

  if (
    !(event?.target as HTMLElement).closest('#extras_menu_button') &&
    !(event?.target as HTMLElement).closest('#extensionsMenu') &&
    !(event?.target as HTMLElement).closest('#options')
  ) {
    extensionsMenu.hide();
    optionsMenu.hide();
  }
}
