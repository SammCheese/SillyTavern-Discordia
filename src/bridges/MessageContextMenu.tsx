import { useContext, useEffect } from 'react';
import { ContextMenuContext } from '../providers/contextMenuProvider';

const { messageEdit, deleteMessage } = await imports('@script');

const MessageContextMenu = () => {
  const { showContextMenu } = useContext(ContextMenuContext);

  const handleCopyMessage = (el) => {
    const text = el.querySelector('.mes_text')?.innerText;
    navigator.clipboard.writeText(text).catch((err) => {
      dislog.error('Failed to copy text: ', err);
    });
  };

  useEffect(() => {
    const chatContainer = document.getElementById('chat');
    if (!chatContainer) return;

    const handleRightClick = (event: MouseEvent) => {
      const messageEl = (event.target as HTMLElement).closest('.mes');

      if (!messageEl) return;

      const messageId = messageEl.getAttribute('mesid');
      if (!messageId) return;

      const isEditing = messageEl.querySelector('textarea#curEditTextarea');
      if (isEditing) return;

      const id = parseInt(messageId);
      //const isUser = messageEl.getAttribute('is_user');
      const isSystem = messageEl.getAttribute('is_system');

      event.preventDefault();
      event.stopPropagation();

      showContextMenu(event as unknown as React.MouseEvent, [
        {
          label: 'Edit Message',
          disabled: isSystem === 'true',
          onClick: () => {
            messageEdit(id);
          },
        },
        {
          label: '---',
          variant: 'separator',
        },
        {
          label: 'Copy Message',
          onClick: () => {
            handleCopyMessage(messageEl);
          },
        },
        {
          label: '---',
          variant: 'separator',
        },
        {
          label: 'Delete Message',
          variant: 'danger',
          onClick: () => {
            deleteMessage(id);
          },
        },
      ]);
    };

    chatContainer.addEventListener('contextmenu', handleRightClick);

    return () => {
      chatContainer.removeEventListener('contextmenu', handleRightClick);
    };
  }, [showContextMenu]);

  return null;
};

export default MessageContextMenu;
