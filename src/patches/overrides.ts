import video from '../../assets/cord.webm';
import { disableDiscordia } from '../utils/discordiaUtils';

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

type DetachedElement = {
  anchor: Comment;
  element: JQuery<HTMLElement>;
};

const detachedChatMenuElements: DetachedElement[] = [];

const detachWithAnchor = (
  $el: JQuery<HTMLElement>,
): JQuery<HTMLElement> | null => {
  const el = $el[0];
  if (!el?.parentNode) return null;

  const anchor = document.createComment('discordia-chat-menu-anchor');
  el.parentNode.insertBefore(anchor, el);
  const detached = $el.detach();
  detachedChatMenuElements.push({ anchor, element: detached });
  return detached;
};

export const restoreChatMenu = () => {
  while (detachedChatMenuElements.length) {
    const backup = detachedChatMenuElements.pop();
    const el = backup?.element[0];
    if (el && backup.anchor.parentNode) {
      backup.anchor.parentNode.replaceChild(el, backup.anchor);
    }
  }
};

// Group Both Chat Icons into one
export const combineChatMenu = () => {
  try {
    const leftSendForm = $('#leftSendForm');
    if (leftSendForm.length) {
      const extensionsMenu = detachWithAnchor(
        $('#extensionsMenu') as JQuery<HTMLElement>,
      )?.addClass('font-family-reset');
      const optionsMenu = detachWithAnchor(
        $('#options') as JQuery<HTMLElement>,
      )?.addClass('font-family-reset');
      detachWithAnchor($('#options_button') as JQuery<HTMLElement>);
      detachWithAnchor($('#extensionsMenuButton') as JQuery<HTMLElement>);

      if (!extensionsMenu || !optionsMenu) return;

      const extrasMenu = $(`
        <div id="extras_menu_button" class="fa-solid fa-plus">
          <div id="unified_extras_menu" class="extras_menu_dropdown">
          </div>
        </div>
      `);

      extrasMenu
        .find('#unified_extras_menu')
        .append(optionsMenu, extensionsMenu);

      extrasMenu.on('click', () => {
        const liveExtensionsMenu = $('#extensionsMenu');
        const liveOptionsMenu = $('#options');

        if (
          liveExtensionsMenu.is(':visible') ||
          liveOptionsMenu.is(':visible')
        ) {
          liveExtensionsMenu.hide();
          liveOptionsMenu.hide();
          return;
        }
        window.removeEventListener('click', toggleCombinedChatMenu);

        window.addEventListener('click', toggleCombinedChatMenu);
        liveExtensionsMenu.show();
        liveOptionsMenu.show();
      });

      leftSendForm.append(extrasMenu);
    }
  } catch (error) {
    dislog.error('Failed to Apply Combine Chat Menu Patch:', error);
  }
};

export const toggleCombinedChatMenu = (event: MouseEvent) => {
  try {
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
  } catch (error) {
    dislog.error('Failed to Handle Extra Listener:', error);
  }
};
