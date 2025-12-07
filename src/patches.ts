export const performPatches = async () => {
  try {
    angleSendButton();
    combineChatMenu();
  } catch (error) {
    console.error('Failed to Perform Patches:', error);
  }
};

// Rotate Send Button 45 Degrees
const angleSendButton = () => {
  try {
    const rightSendForm = $('#rightSendForm');
    if (rightSendForm) {
      const send_button = rightSendForm.find('#send_but');
      send_button.addClass('fa-rotate-by');
      send_button.attr('style', '--fa-rotate-angle: 45deg');
    }
  } catch (error) {
    console.error('Failed to Apply Send Button Patch:', error);
  }
};

// Group Both Chat Icons into one
const combineChatMenu = () => {
  try {
    const leftSendForm = $('#leftSendForm');
    if (leftSendForm) {
      const extensionsMenu = $('#extensionsMenu').addClass('font-family-reset');
      const optionsMenu = $('#options').addClass('font-family-reset');

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
        if (extensionsMenu.is(':visible') || optionsMenu.is(':visible')) {
          window.removeEventListener('click', toggleCombinedChatMenu);
          extensionsMenu.hide();
          optionsMenu.hide();
          return;
        }

        window.addEventListener('click', toggleCombinedChatMenu);
        $('#extensionsMenu').show();
        $('#options').show();
      });
      leftSendForm.empty();
      leftSendForm.append(extrasMenu);
    }
  } catch (error) {
    console.error('Failed to Apply Combine Chat Menu Patch:', error);
  }
};

const toggleCombinedChatMenu = (event: MouseEvent) => {
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
    console.error('Failed to Handle Extra Listener:', error);
  }
};


