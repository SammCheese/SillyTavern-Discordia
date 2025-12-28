// @ts-expect-error Video Import
import video from '../assets/cord.webm';
import { DISCORDIA_EVENTS } from './events/eventTypes';

const templateDataCache: Record<string, object> = {};
export const extensionTemplates: JQuery<HTMLElement>[] = [];

export const performPatches = async () => {
  try {
    await hijackJqueryError();
    await hijackExtensionTemplateRendering();
    overrideSpinner();
    angleSendButton();
    combineChatMenu();
    moveExtensionSettingsToUI();
  } catch (error) {
    console.error('Failed to Perform Patches:', error);
  }
};

const hijackExtensionTemplateRendering = async () => {
  try {
    const ctx = window.SillyTavern.getContext();

    const proxy = new Proxy(ctx, {
      get(target, prop, receiver) {
        if (prop === 'renderExtensionTemplateAsync') {
          return async (...args) => {
            const [
              extensionName,
              templateId,
              templateData,
              sanitize = true,
              localize = true,
            ] = args;

            templateDataCache[extensionName] = {
              extensionName,
              templateId,
              templateData,
              sanitize,
              localize,
            };

            window.discordia.templateCache = templateDataCache;


            // @ts-expect-error apply
            // eslint-disable-next-line prefer-spread
            return target[prop].apply(target, args);
          };
        }
        return Reflect.get(target, prop, receiver);
      },
    });
    SillyTavern.getContext = () => proxy;

    console.debug('Successfully Hijacked Extension Template Rendering');
  } catch (error) {
    console.error('Failed to Hijack Extension Template Rendering:', error);
  }
};

const hijackJqueryError = () => {
  try {
    const originalOn = $.fn.on;

    const TARGET_CONTAINER_IDS = ['extensions_settings','extensions_settings2'];
    const EXTENSION_NAME_REGEX = /extensions\/(?:third-party\/)?([^/]+)\//;

    const IGNORED_TAGS = { 'BODY': true, 'HTML': true, 'HEAD': true };

    let containers: HTMLElement[] = [];

    const TARGET_CONTAINERS = TARGET_CONTAINER_IDS.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    containers = TARGET_CONTAINERS;

    $.fn.on = function (this, ...args) {
      // @ts-expect-error apply
      if (!this.length) return originalOn.apply(this, args);
      if (!containers.length) containers = TARGET_CONTAINERS;

      const firstElem = this[0];

      if (containers.length && firstElem?.isConnected && !containers.some(container => container.contains(firstElem))) {
        // @ts-expect-error apply
        return originalOn.apply(this, args);
      }


      if (IGNORED_TAGS[firstElem!.tagName]) {
        // @ts-expect-error apply
        return originalOn.apply(this, args);
      }

      try {
        const err = new Error();

        // Parse stack, get last two lines (to avoid this function being first)
        const stack = err.stack?.split('\n').slice(-2).join('\n');

        if (!stack) {
          console.warn('No stack trace available to determine extension name');
          // @ts-expect-error apply
          return originalOn.apply(this, args);
        }

        const match = EXTENSION_NAME_REGEX.exec(stack);
        let extensionName = 'unknown';

        if (match && match[1]) {
          extensionName = match[1];
        }

        if (extensionName != 'unknown') {
          this.attr('discordia-settings-owner', extensionName!);
        }
      } catch {
        console.warn('Failed to attach extension name to jQuery element');
      }
      // @ts-expect-error apply
      return originalOn.apply(this, args);
    };

    console.debug('Successfully Hijacked jQuery HTML Method');
  } catch (error) {
    console.error('Failed to Hijack jQuery HTML Method:', error);
  }
};

const moveExtensionSettingsToUI = async () => {
  const { eventSource, event_types } = await imports('@script');

  const moveSettings = async () => {
    try {
      const settingsContainer = $('#extensions_settings2');
      if (settingsContainer.length === 0) return;

      settingsContainer.children().each((_, elem) => {
        extensionTemplates.push($(elem).clone(true));
      });

      window.discordia.extensionTemplates = extensionTemplates;

      eventSource.emit(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED);
    } catch (error) {
      console.error('Failed to Move Extension Settings to UI:', error);
    }
    eventSource.removeListener(
      event_types.EXTENSION_SETTINGS_LOADED,
      moveSettings,
    );
  };

  eventSource.on(event_types.EXTENSION_SETTINGS_LOADED, moveSettings);
};

const splashTexts = [
  'Gathering your Characters...',
  'Summoning the spirits...',
  'Warning the AI...',
  'Aligning the pixels...',
  'Loading your chat experience...',
  'Preparing the fun...',
  'Delaying reality...',
];

const overrideSpinner = () => {
  try {
    const loadSpinner = $('#load-spinner');
    if (loadSpinner) {
      loadSpinner.remove();
      const randomIndex = Math.floor(Math.random() * splashTexts.length);
      const randomText = splashTexts[randomIndex];
      const parent = $('#loader');
      const newSpinner = $(`
      <div id="load-spinner">
        <video autoplay loop muted playsinline  style="width: 300px; height: 300px; object-fit: cover; border-radius: 12px;">
          <source src="${video}" type="video/webm" />
        </video>
        <span id="loading-text" style="color: white; font-size: 1.2rem; margin-top: -40px;">
          ${randomText}
        </span>
      </div>
      `).attr(
        'style',
        'display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100dvw; height: 100dvh; position: absolute; top: 0; left: 0; z-index: 1000; background-color: #1e1e1e;',
      );
      parent.append(newSpinner);
    }
  } catch (error) {
    console.error('Failed to Apply Spinner Patch:', error);
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
