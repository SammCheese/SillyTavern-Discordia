export {};

export const unangleSendButton = () => {
  try {
    const rightSendForm = $('#rightSendForm');
    if (rightSendForm) {
      const send_button = rightSendForm.find('#send_but');
      send_button.removeClass('fa-rotate-by');
      send_button.removeAttr('style');
    }
  } catch (error) {
    dislog.error('Failed to Undo Send Button Patch:', error);
  }
};

export const unpatchSpinner = () => {
  try {
    const originalLoadSpinner = window.discordia.backups.originalLoadSpinner;
    if (originalLoadSpinner) {
      $('#load-spinner').remove();
      $('#loader').append(originalLoadSpinner);
    }
  } catch (error) {
    dislog.error('Failed to Undo Spinner Patch:', error);
  }
};

export const unpatchCombinedChatMenu = () => {
  try {
    $('#extensionsMenuButton').show();
    $('#options_button').show();
    $('#extras_menu_button').remove();
  } catch (error) {
    dislog.error('Failed to Undo Combined Chat Menu Patch:', error);
  }
};
