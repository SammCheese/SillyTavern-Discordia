import { useCallback, useEffect, useRef, useState } from 'react';

import {
  messageEdit,
  setEditedMessageId,
  setSendButtonState,
  eventSource,
  event_types,
} from '../st/script';
import { isMobile } from '../st/rossMods';
type BridgeMessage = {
  id?: number | string;
  mesid?: number | string;
  content?: string;
  mes?: string;
};

const BANNER_ID = 'discordia-editing-banner';
const BANNER_EVENTS_NS = '.discordiaInputEdit';

const getMessageId = (message?: BridgeMessage): number | null => {
  const raw = message?.id ?? message?.mesid;
  if (raw === undefined || raw === null) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
};

const getMessageContent = (message?: BridgeMessage): string => {
  if (!message) return '';
  if (typeof message.content === 'string') return message.content;
  if (typeof message.mes === 'string') return message.mes;
  return '';
};

const MessageEditingBridge = (message?: BridgeMessage) => {
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingMessageContent, setEditingMessageContent] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalInputContent, setOriginalInputContent] = useState('');
  const [sendButtonDisabled, setSendButtonDisabled] = useState(false);
  const captureHandlersRef = useRef<{
    click?: EventListener;
    submit?: EventListener;
    keydown?: EventListener;
  }>({});

  const unbindCaptureSubmitHandlers = useCallback(() => {
    const sendButtonEl = document.getElementById('send_but');
    const sendFormEl = document.getElementById('send_form');
    const textareaEl = document.getElementById(
      'send_textarea',
    ) as HTMLTextAreaElement | null;

    if (captureHandlersRef.current.click && sendButtonEl) {
      sendButtonEl.removeEventListener(
        'click',
        captureHandlersRef.current.click,
        true,
      );
    }

    if (captureHandlersRef.current.submit && sendFormEl) {
      sendFormEl.removeEventListener(
        'submit',
        captureHandlersRef.current.submit,
        true,
      );
    }

    if (captureHandlersRef.current.keydown && textareaEl) {
      textareaEl.removeEventListener(
        'keydown',
        captureHandlersRef.current.keydown,
        true,
      );
    }

    captureHandlersRef.current = {};
  }, []);

  const syncNativeEditTextareaById = useCallback((messageId: number) => {
    const inputField = $('textarea#send_textarea');
    const messageEl = $(`.mes[mesid="${messageId}"]`);
    const nativeEditTextarea = messageEl.find('textarea#curEditTextarea');
    const value = String(inputField.val() ?? '');

    if (!nativeEditTextarea.length) return;

    nativeEditTextarea
      .val(value)
      .trigger('input', { source: 'discordia-main-input' });
    setEditingMessageContent(value);
  }, []);

  const syncNativeEditTextarea = useCallback(() => {
    if (editingMessageId === null) return;
    syncNativeEditTextareaById(editingMessageId);
  }, [editingMessageId, syncNativeEditTextareaById]);

  const cleanupBridgeUi = useCallback(
    (restoreInput: boolean, messageIdOverride?: number) => {
      $('#send_form').off(BANNER_EVENTS_NS);
      $('#send_but').off(BANNER_EVENTS_NS);
      $('textarea#send_textarea').off(BANNER_EVENTS_NS);
      $(`#${BANNER_ID}`).remove();
      unbindCaptureSubmitHandlers();

      if (restoreInput) {
        const inputField = $('textarea#send_textarea');
        inputField
          .val(originalInputContent)
          .trigger('input', { source: 'discordia-main-input' })
          .trigger('focus');
      }

      const targetMessageId = messageIdOverride ?? editingMessageId;
      if (targetMessageId !== null && targetMessageId !== undefined) {
        $(`.mes[mesid="${targetMessageId}"]`).removeClass('discordia-editing');
      }

      setIsEditMode(false);
      setSendButtonDisabled(false);
      setEditingMessageId(null);
      setEditingMessageContent('');
    },
    [editingMessageId, originalInputContent, unbindCaptureSubmitHandlers],
  );

  const submitEditById = useCallback(
    (messageId: number) => {
      syncNativeEditTextareaById(messageId);

      const messageEl = $(`.mes[mesid="${messageId}"]`);
      const doneButton = messageEl.find('.mes_edit_done');
      if (doneButton.length) {
        doneButton.trigger('click');
      }

      cleanupBridgeUi(true, messageId);
    },
    [cleanupBridgeUi, syncNativeEditTextareaById],
  );

  const submitEdit = useCallback(() => {
    if (editingMessageId === null) return;

    submitEditById(editingMessageId);
  }, [editingMessageId, submitEditById]);

  const cancelEditingById = useCallback(
    (messageId: number) => {
      const messageCancelButton = $(
        `.mes[mesid="${messageId}"] .mes_edit_cancel`,
      );
      if (messageCancelButton.length) {
        messageCancelButton.first().trigger('click');
      }

      $('.mes_edit_cancel:visible').trigger('click');

      setEditedMessageId(undefined);
      setSendButtonState(false);

      cleanupBridgeUi(true, messageId);
    },
    [cleanupBridgeUi],
  );

  const cancelEditing = useCallback(() => {
    if (editingMessageId === null) return;
    cancelEditingById(editingMessageId);
  }, [cancelEditingById, editingMessageId]);

  const bindBridgeEvents = useCallback(
    (activeMessageId: number) => {
      const banner = $(`#${BANNER_ID}`);
      const inputField = $('textarea#send_textarea');
      const isMobileDevice = isMobile();

      inputField
        .off(`input${BANNER_EVENTS_NS}`)
        .on(`input${BANNER_EVENTS_NS}`, () => {
          syncNativeEditTextarea();
        });

      banner
        .find('[data-action="cancel"]')
        .off(`click${BANNER_EVENTS_NS}`)
        .on(`click${BANNER_EVENTS_NS}`, (event) => {
          event.preventDefault();
          cancelEditingById(activeMessageId);
        });

      banner
        .find('[data-action="submit"]')
        .off(`click${BANNER_EVENTS_NS}`)
        .on(`click${BANNER_EVENTS_NS}`, (event) => {
          event.preventDefault();
          submitEditById(activeMessageId);
        });

      $('#send_form')
        .off(`submit${BANNER_EVENTS_NS}`)
        .on(`submit${BANNER_EVENTS_NS}`, (event) => {
          event.preventDefault();
          event.stopPropagation();
          submitEditById(activeMessageId);
        });

      $('#send_but')
        .off(`click${BANNER_EVENTS_NS}`)
        .on(`click${BANNER_EVENTS_NS}`, (event) => {
          event.preventDefault();
          event.stopPropagation();
          submitEditById(activeMessageId);
        });

      unbindCaptureSubmitHandlers();

      const sendButtonEl = document.getElementById('send_but');
      const sendFormEl = document.getElementById('send_form');
      const textareaEl = document.getElementById(
        'send_textarea',
      ) as HTMLTextAreaElement | null;

      const onCaptureSubmit: EventListener = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if ('stopImmediatePropagation' in event) {
          event.stopImmediatePropagation();
        }
        submitEditById(activeMessageId);
      };

      const onCaptureKeydown: EventListener = (event) => {
        if (isMobileDevice) return;
        const keyEvent = event as KeyboardEvent;
        const isPlainEnter =
          keyEvent.key === 'Enter' &&
          !keyEvent.shiftKey &&
          !keyEvent.ctrlKey &&
          !keyEvent.metaKey &&
          !keyEvent.altKey;

        if (!isPlainEnter) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        if ('stopImmediatePropagation' in event) {
          event.stopImmediatePropagation();
        }
        submitEditById(activeMessageId);
      };

      captureHandlersRef.current.click = onCaptureSubmit;
      captureHandlersRef.current.submit = onCaptureSubmit;
      captureHandlersRef.current.keydown = onCaptureKeydown;

      sendButtonEl?.addEventListener('click', onCaptureSubmit, true);
      sendFormEl?.addEventListener('submit', onCaptureSubmit, true);
      textareaEl?.addEventListener('keydown', onCaptureKeydown, true);
    },
    [
      cancelEditingById,
      submitEditById,
      syncNativeEditTextarea,
      unbindCaptureSubmitHandlers,
    ],
  );

  const startEditing = useCallback(
    async (overrideMessage?: BridgeMessage) => {
      const targetMessage = overrideMessage ?? message;
      const id = getMessageId(targetMessage);
      if (id === null) return;

      if (isEditMode) {
        cancelEditing();
      }

      await messageEdit(id);

      const formShell = $('#form_sheld');
      const inputField = $('textarea#send_textarea');
      const initialText = getMessageContent(targetMessage);
      const messageEl = $(`.mes[mesid="${id}"]`);
      const nativeEditTextarea = messageEl.find('textarea#curEditTextarea');
      const nativeText = String(nativeEditTextarea.val() ?? initialText);

      const bannerHtml = `
      <div id="${BANNER_ID}" class="editing-banner">
        <span>Editing message #${id}</span>
        <button class="discordia-cancel-edit" data-action="cancel" type="button">
          <div class="fa-icon fa-solid fa-circle-xmark" />
        </button>
      </div>
    `;

      messageEl.addClass('discordia-editing');

      $(`#${BANNER_ID}`).remove();
      formShell.prepend(bannerHtml);

      nativeEditTextarea.css({ display: 'none' });

      setOriginalInputContent(String(inputField.val() ?? ''));
      setEditingMessageId(id);
      setEditingMessageContent(nativeText);
      setIsEditMode(true);
      setSendButtonDisabled(true);

      inputField
        .val(nativeText)
        .trigger('input', { source: 'discordia-main-input' })
        .trigger('focus');
      inputField.css({ height: 'auto' });

      bindBridgeEvents(id);
    },
    [bindBridgeEvents, cancelEditing, isEditMode, message],
  );

  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isEditMode) {
        event.preventDefault();
        cancelEditing();
      }
    },
    [cancelEditing, isEditMode],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleEscapeKey);
    eventSource?.on(event_types.CHAT_CHANGED, cancelEditing);
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
      eventSource?.removeListener(event_types.CHAT_CHANGED, cancelEditing);
    };
  }, [cancelEditing, handleEscapeKey]);

  useEffect(() => {
    return () => {
      $('#send_form').off(BANNER_EVENTS_NS);
      $('#send_but').off(BANNER_EVENTS_NS);
      $('textarea#send_textarea').off(BANNER_EVENTS_NS);
      $(`#${BANNER_ID}`).remove();
      unbindCaptureSubmitHandlers();
    };
  }, [unbindCaptureSubmitHandlers]);

  return {
    editingMessageId,
    editingMessageContent,
    isEditMode,
    sendButtonDisabled,
    startEditing,
    cancelEditing,
    submitEdit,
    setEditingMessageContent,
  };
};

export default MessageEditingBridge;
