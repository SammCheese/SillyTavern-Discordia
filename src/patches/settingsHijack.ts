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

interface PendingTag {
  elements: JQuery<HTMLElement>;
  owner: string;
}

const pendingTags: PendingTag[] = [];
let isTaggingScheduled = false;

const safeRequestIdleCallback = typeof window.requestIdleCallback === 'function' ?
  window.requestIdleCallback :
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  (cb: Function) => setTimeout(() => cb({ timeRemaining: () => 50 }), 1);

const flushTagsNow = () => {
  while (pendingTags.length > 0) {
    const { elements, owner } = pendingTags.shift()!;
    elements.each((_, elem) => {
      try {
        (elem as HTMLElement).setAttribute('discordia-settings-owner', owner);
      } catch {
        // Silent fail
      }
    });
  }
  isTaggingScheduled = false;
};

const scheduleTagging = () => {
  if (!isTaggingScheduled) {
    isTaggingScheduled = true;
    safeRequestIdleCallback(flushTagsNow);
  }
};

export const hijackJqueryError = () => {
  try {
    const originalOn = $.fn.on;

    $.fn.on = function (this, ...args) {
      // @ts-expect-error apply
      if (!this.length) return originalOn.apply(this, args);
      // @ts-expect-error apply
      if (IGNORED_TAGS_SET.has(this[0]?.tagName)) return originalOn.apply(this, args);

      let owner: string | null = null;

      if (document.currentScript && (document.currentScript as HTMLScriptElement).src) {
        const src = (document.currentScript as HTMLScriptElement).src;
        const match = EXTENSION_NAME_REGEX.exec(src);
        if (match?.[1]) owner = match[1];
      }

      if (!owner) {
        try {
          const oldLimit = Error.stackTraceLimit;
          Error.stackTraceLimit = 3;

          // V8+ stack trace handling
          if (Error.prepareStackTrace) {
            const orig = Error.prepareStackTrace;
            Error.prepareStackTrace = (_, stack) => stack;
            const stack = new Error().stack as unknown as NodeJS.CallSite[];
            Error.prepareStackTrace = orig;

            if (stack[2] || stack[1]) {
              const file = stack[2] ? stack[2].getFileName() : stack[1]?.getFileName();
              const match = file && EXTENSION_NAME_REGEX.exec(file);
              if (match) owner = match[1] ?? null;
            }
          // Non-V8 stack trace handling
          } else {
            const stack = new Error().stack;
            if (stack) {
              const match = EXTENSION_NAME_REGEX.exec(stack);
              if (match) owner = match[1] ?? null;
            }
          }
          Error.stackTraceLimit = oldLimit;
        } catch {
          // Silent fail
        }
      }

      if (owner && !EXTENSION_NAME_NEGLECT_SET.has(owner)) {
        pendingTags.push({ elements: this, owner });
        scheduleTagging();
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
      flushTagsNow();

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
