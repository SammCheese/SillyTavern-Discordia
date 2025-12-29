import { DISCORDIA_EVENTS } from '../events/eventTypes';

const { eventSource, event_types } = await imports('@script');


const TARGET_CONTAINER_IDS = ['extensions_settings', 'extensions_settings2'] as const;
const EXTENSION_NAME_REGEX = /extensions\/(?:third-party\/)?(?!(?:SillyTavern-Discordia|third-party)\/)([^/]+)\//;
const EXTENSION_NAME_NEGLECT_SET = new Set(['SillyTavern-Discordia']);
const IGNORED_TAGS_SET = new Set(['BODY', 'HTML', 'HEAD']);
const LATELOADER_LEEWAY_MS = 20000;

let cachedContainers: HTMLElement[] = [];
let containersCached = false;

const getContainers = (): HTMLElement[] => {
  if (!containersCached) {
    cachedContainers = TARGET_CONTAINER_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    containersCached = true;
  }
  return cachedContainers;
};

export const hijackJqueryError = () => {
  try {
    const originalOn = $.fn.on;
    const containers = getContainers();
    const hasContainers = containers.length > 0;

    $.fn.on = function (this, ...args) {
      // @ts-expect-error apply
      if (!this.length) return originalOn.apply(this, args);

      const firstElem = this[0] as HTMLElement;

      // @ts-expect-error apply
      if (IGNORED_TAGS_SET.has(firstElem.tagName)) return originalOn.apply(this, args);

      // Check if element is in target containers
      if (hasContainers && firstElem.isConnected &&
          !containers.some((container) => container.contains(firstElem))) {
        // @ts-expect-error apply
        return originalOn.apply(this, args);
      }

      try {
        const stack = new Error().stack;
        if (stack) {
          const match = EXTENSION_NAME_REGEX.exec(stack);
          if (match?.[1] && !EXTENSION_NAME_NEGLECT_SET.has(match[1])) {
            this.attr('discordia-settings-owner', match[1]);
          }
        }
      } catch {
        // Silent fail
      }

      // @ts-expect-error apply
      return originalOn.apply(this, args);
    };

    const restoreAfterTime = () => {
      setTimeout(() => {
        $.fn.on = originalOn;
        eventSource.removeListener(
          DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED,
          restoreAfterTime,
        );
      }, LATELOADER_LEEWAY_MS);
    };

    eventSource.on(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED, restoreAfterTime);
  } catch (error) {
    console.error('Failed to Hijack jQuery HTML Method:', error);
  }
};

export const poolDOMExtensions = async () => {
  let observer: MutationObserver | null = null;
  let debounceTimer: number | null = null;
  window.discordia.extensionTemplates = [];

  const captureExtensions = () => {
    try {
      const containers = getContainers();
      if (containers.length === 0) return;

      window.discordia.extensionTemplates = containers.flatMap((container) =>
        Array.from(container.children).map((elem) => $(elem).clone(true))
      );

      eventSource.emit(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED);
    } catch (error) {
      console.error('Failed to Capture Extension Settings:', error);
    }
  };

  const debouncedCapture = () => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = window.setTimeout(() => {
      captureExtensions();
      debounceTimer = null;
    }, 100);
  };

  const startObserving = () => {
    const containers = getContainers();
    if (containers.length === 0) return;

    observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.addedNodes.length > 0)) {
        debouncedCapture();
      }
    });

    for (const container of containers) {
      observer.observe(container, {
        childList: true,
        subtree: false,
      });
    }

    setTimeout(() => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      eventSource.removeListener(
        event_types.EXTENSION_SETTINGS_LOADED,
        startObserving,
      );
    }, LATELOADER_LEEWAY_MS);
  };

  captureExtensions();

  // SillyTavern fires this after extensions are loaded
  // Start Observing for lateloaders
  eventSource.on(event_types.EXTENSION_SETTINGS_LOADED, startObserving);
};
