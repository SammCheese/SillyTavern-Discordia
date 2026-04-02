import { useEffect } from 'react';
import { useContextMenu } from '../providers/contextMenuProvider';
import type { ContextMenuItem } from '../components/common/ContextMenuEntry/ContextMenuEntry';

const { messageEdit, deleteMessage } = await imports('@script');

const allowedOriginalToolsTitle = [
  '[title]Translate message',
  '[title]Prompt',
  '[title]Narrate',
  '[title]Generate Image',
  '[title]Embed file or image',
  '[title]Create Branch',
];

const MessageContextMenu = () => {
  const { showContextMenu } = useContextMenu();

  const handleCopyMessage = (el) => {
    const text = el.querySelector('.mes_text')?.innerText;
    navigator.clipboard.writeText(text).catch((err) => {
      dislog.error('Failed to copy text: ', err);
    });
  };

  const getOriginalTools = () => {
    const toolsElem = document.querySelector('.extraMesButtons');
    if (!toolsElem) return null;

    const children = Array.from(toolsElem.children);
    if (children.length === 0) return null;

    const tools: ContextMenuItem[] = [];
    children.forEach((child) => {
      const oLabel =
        child.getAttribute('data-i18n') ||
        child.getAttribute('title') ||
        child.getAttribute('aria-label') ||
        '';

      if (!allowedOriginalToolsTitle.includes(oLabel)) return;

      const label = child.getAttribute('title') || oLabel || 'Unknown Tool';

      tools.push({
        label,
        onClick: () =>
          child.dispatchEvent(new MouseEvent('click', { bubbles: true })),
      });
    });

    return tools;
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
        { label: '---', variant: 'separator' },
        ...(getOriginalTools() || []),
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
