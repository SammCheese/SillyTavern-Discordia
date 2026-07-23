import video from '../../assets/cord.webm';
import { disableDiscordia } from '../utils/discordiaUtils';
import { plusMenuOpenStore } from '../services/plusMenuService';

const splashTexts = [
  'Gathering your Characters...',
  'Summoning the spirits...',
  'Warning the AI...',
  'Brewing some coffee...',
  'I thought this is all there is...',
  'Aligning the pixels...',
  'Loading your chat experience...',
  'Preparing the fun...',
  'Delaying reality...',
  "Do you know when you're coming back?",
  'Follow me into the endless night...',
];

export const overrideSpinner = () => {
  try {
    const loadSpinner = $('#load-spinner');
    // Backup for unpatch
    window.discordia.backups.originalLoadSpinner = loadSpinner.clone();

    const getRandomSplashText = () => {
      const randomIndex = Math.floor(Math.random() * splashTexts.length);
      return splashTexts[randomIndex];
    };

    if (loadSpinner.length) {
      loadSpinner.remove();
      const randomText = getRandomSplashText();
      const parent = $('#loader');
      const newSpinner = $(`
      <div id="load-spinner">
        <div id="disable-discordia" style="position: absolute; top: 20px; right: 20px; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 12px; transition: background-color 0.3s;">
          <span>X</span>
          <span>Temporarily Disable Discordia</span>
        </div>
        <video autoplay loop muted playsinline  style="width: 300px; height: 300px; object-fit: cover; border-radius: 12px;">
          <source src="${video}" type="video/webm" />
        </video>
        <span id="loading-text" style="color: white; font-size: 1.2rem; margin-top: -40px;">
          ${randomText}
        </span>
      </div>
      `).css({
        width: '100dvw',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        backgroundColor: '#1e1e1e',
      });
      newSpinner.find('#disable-discordia').on('click', () => {
        disableDiscordia();
      });
      parent.append(newSpinner);
    }
  } catch (error) {
    dislog.error('Failed to Apply Spinner Patch:', error);
  }
};

// Rotate Send Button 45 Degrees
export const angleSendButton = () => {
  try {
    const rightSendForm = $('#rightSendForm');
    if (rightSendForm.length) {
      const send_button = rightSendForm.find('#send_but');
      send_button.addClass('fa-rotate-by');
      send_button.attr('style', '--fa-rotate-angle: 45deg');
    }
  } catch (error) {
    dislog.error('Failed to Apply Send Button Patch:', error);
  }
};

/**
 * Replaces ST's "options" and "wand" buttons with a single "+" button that
 * opens Discordia's React menu (components/plusMenu). The original menus
 * stay in the DOM, hidden — the React menu parses their entries and
 * re-dispatches clicks to them (services/plusMenuService).
 */
export const combineChatMenu = () => {
  try {
    const leftSendForm = $('#leftSendForm');
    if (!leftSendForm.length) return;

    $('#options_button').hide();
    $('#extensionsMenuButton').hide();

    const extrasButton = $(
      '<div id="extras_menu_button" class="fa-solid fa-plus interactable" title="Open menu"></div>',
    );

    extrasButton.on('click', (event) => {
      event.stopPropagation();
      plusMenuOpenStore.set(!plusMenuOpenStore.get());
    });

    leftSendForm.append(extrasButton);
  } catch (error) {
    dislog.error('Failed to Apply Combine Chat Menu Patch:', error);
  }
};
