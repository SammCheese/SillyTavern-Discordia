import { DISCORDIA_EVENTS } from '../events/eventTypes';

const { eventSource, event_types } = await imports('@script');


const TARGET_CONTAINER_IDS = ['extensions_settings', 'extensions_settings2'] as const;
const EXTENSION_NAME_REGEX = /extensions\/(?:third-party\/)?(?!(?:SillyTavern-Discordia|third-party)\/)([^/]+)\//;
const EXTENSION_NAME_NEGLECT_SET = new Set(['SillyTavern-Discordia']);
const IGNORED_TAGS_SET = new Set(['BODY', 'HTML', 'HEAD']);

export const hijackJqueryError = () => {
  try {
    const originalOn = $.fn.on;
    let containers: HTMLElement[] = [];
    let containersCached = false;

    const initContainers = () => {
      if (!containersCached) {
        containers = TARGET_CONTAINER_IDS
          .map((id) => document.getElementById(id))
          .filter(Boolean) as HTMLElement[];
        containersCached = true;
      }
    };

    initContainers();

    $.fn.on = function (this, ...args) {
      // @ts-expect-error apply
      if (!this.length) return originalOn.apply(this, args);

      const firstElem = this[0] as HTMLElement;

      if (IGNORED_TAGS_SET.has(firstElem.tagName)) {
        // @ts-expect-error apply
        return originalOn.apply(this, args);
      }

      if (!containersCached) {
        initContainers();
      }

      // Check if element is in target containers
      if (containers.length > 0 && firstElem.isConnected) {
        const isInside = containers.some((container) => container.contains(firstElem));
        // @ts-expect-error apply
        if (!isInside) return originalOn.apply(this, args);
      }

      try {
        const stack = new Error().stack;

        if (!stack) {
          // @ts-expect-error apply
          return originalOn.apply(this, args);
        }

        const match = EXTENSION_NAME_REGEX.exec(stack);
        if (match?.[1] && !EXTENSION_NAME_NEGLECT_SET.has(match[1])) {
          this.attr('discordia-settings-owner', match[1]);
        }
      } catch {
        // Silent fail
      }

      // @ts-expect-error apply
      return originalOn.apply(this, args);
    };

    const restore = () => {
      $.fn.on = originalOn;
      eventSource.removeListener(
        DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED,
        restore,
      );
    };

    eventSource.on(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED, restore);
  } catch (error) {
    console.error('Failed to Hijack jQuery HTML Method:', error);
  }
};

export const poolDOMExtensions = async () => {
  let isListenerActive = true;

  const moveSettings = async () => {
    if (!isListenerActive) return;

    try {
      const containers = [
        document.getElementById('extensions_settings'),
        document.getElementById('extensions_settings2'),
      ].filter(Boolean) as HTMLElement[];

      if (containers.length === 0) return;

      window.discordia.extensionTemplates = [];

      for (const container of containers) {
        for (const elem of container.children) {
          window.discordia.extensionTemplates.push($(elem).clone(true));
        }
      }

      eventSource.emit(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED);
    } catch (error) {
      console.error('Failed to Move Extension Settings:', error);
    } finally {
      isListenerActive = false;
      eventSource.removeListener(event_types.EXTENSION_SETTINGS_LOADED, moveSettings);
    }
  };

  eventSource.on(event_types.EXTENSION_SETTINGS_LOADED, moveSettings);
};
