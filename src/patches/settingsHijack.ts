import { DISCORDIA_EVENTS } from '../events/eventTypes';
import { runTaskInIdle } from '../utils/utils';
import Tracekit from 'tracekit';

const { eventSource, event_types } = await imports('@script');

const TARGET_CONTAINER_IDS = ['extensions_settings', 'extensions_settings2'];
const EXTENSION_NAME_REGEX =
  /extensions\/(?:third-party\/)?(?!(?:SillyTavern-Discordia|third-party)\/)([^/]+)\//;
const EXTENSION_NAME_NEGLECT_SET = new Set(['SillyTavern-Discordia']);
const IGNORED_TAGS_SET = new Set([
  'BODY',
  'HTML',
  'HEAD',
  'SCRIPT',
  'HTMLDOCUMENT',
  'DOCUMENT',
]);
const LATELOADER_LEEWAY_MS = 20000;

let cachedContainers: HTMLElement[] = [];

const OWNER_SYMBOL = Symbol('discordia-owner');
const elementOwnerMap = new WeakMap<Element, string>();

Tracekit.remoteFetching = false;
Tracekit.collectWindowErrors = false;

const getContainers = (): HTMLElement[] => {
  if (cachedContainers.length < TARGET_CONTAINER_IDS.length) {
    cachedContainers = TARGET_CONTAINER_IDS.map((id) =>
      document.getElementById(id),
    ).filter(Boolean) as HTMLElement[];
  }
  return cachedContainers;
};

export const getElementOwner = (element: Element): string | null => {
  return elementOwnerMap.get(element) ?? null;
};

const applyOwnership = (
  element: HTMLElement | Element | JQuery,
  owner: string,
) => {
  try {
    if (element instanceof jQuery) {
      (element as JQuery<Element>).each((_, el) => {
        elementOwnerMap.set(el, owner);
        el.setAttribute?.('data-discordia-settings-owner', owner);
      });
      element[OWNER_SYMBOL] = owner;
    } else if (element instanceof Element) {
      elementOwnerMap.set(element, owner);
      element.setAttribute?.('data-discordia-settings-owner', owner);
    }
  } catch {
    // ignore
  }
};

export const getOwnerFromJQuery = ($el: JQuery): string | null => {
  if ($el[OWNER_SYMBOL]) {
    return $el[OWNER_SYMBOL];
  }

  for (let i = 0; i < $el.length; i++) {
    const owner = elementOwnerMap.get($el[i] as Element);
    if (owner) return owner;
  }

  for (let i = 0; i < $el.length; i++) {
    const attr = $el[i]?.getAttribute?.('data-discordia-settings-owner');
    if (attr) return attr;
  }

  return null;
};

export const getOwner = (target: JQuery | Element | string): string | null => {
  try {
    if (typeof target === 'string') {
      target = $(target);
    }

    if (target instanceof jQuery) {
      return getOwnerFromJQuery(target as JQuery<HTMLElement>);
    }

    if (target instanceof Element) {
      return (
        elementOwnerMap.get(target) ??
        target.getAttribute('data-discordia-settings-owner') ??
        null
      );
    }
  } catch (e) {
    console.error('[Discordia] getOwner error:', e);
  }

  return null;
};

const findOwnerAtCreationTime = (): string | null => {
  if (
    document.currentScript &&
    (document.currentScript as HTMLScriptElement).src
  ) {
    const src = (document.currentScript as HTMLScriptElement).src;
    const match = EXTENSION_NAME_REGEX.exec(src);
    if (match?.[1] && !EXTENSION_NAME_NEGLECT_SET.has(match[1])) {
      return match[1];
    }
  }

  try {
    const e = new Error('Finding owner extension');
    const err = Tracekit.computeStackTrace(e, 10);

    const file = err.stack.find((frame) => {
      if (!frame.url) return false;
      const match = EXTENSION_NAME_REGEX.exec(frame.url);
      return match?.[1] && !EXTENSION_NAME_NEGLECT_SET.has(match[1]);
    })?.url;

    if (file) {
      const match = EXTENSION_NAME_REGEX.exec(file);
      if (match?.[1]) {
        return match[1];
      }
    }

    return null;
  } catch (e) {
    console.error('[Discordia] findOwnerAtCreationTime error:', e);
  }

  return null;
};

export const hijackJquery = () => {
  try {
    const originalAppend = $.fn.append;
    const originalAppendTo = $.fn.appendTo;
    const originalOn = $.fn.on;
    // @ts-expect-error exists
    const originalInit = $.fn.init;
    let cleanupTimer: number | null = null;

    const isTargetContainer = (target: JQuery<HTMLElement>): boolean => {
      try {
        const $target = $(target);
        if (!$target.length) return false;
        const id = $target.attr('id');
        if (id && TARGET_CONTAINER_IDS.includes(id)) return true;
        if (TARGET_CONTAINER_IDS.some(tid => $target.closest(`#${tid}`).length > 0)) {
            return true;
        }

        return false;
      } catch {
        return false;
      }
    };

    // @ts-expect-error exists
    $.fn.init = function (selector, context) {
      const result = originalInit.call(this, selector, context);
      const isHTMLCreation =
        typeof selector === 'string' && selector.trim().startsWith('<');

      if (isHTMLCreation || !selector) {
        const owner = findOwnerAtCreationTime();
        if (owner) {
          result[OWNER_SYMBOL] = owner;
        }
      }

      return result;
    };

    // @ts-expect-error exists
    $.fn.init.prototype = $.fn;

    $.fn.append = function (this, ...args) {
      // @ts-expect-error apply
      if (!this.length) return originalAppend.apply(this, args);

      if (isTargetContainer(this)) {
        let owner: string | null = null;
        let content = args[0];

        if (content instanceof jQuery) {
          owner = getOwnerFromJQuery(content as JQuery<HTMLElement>);
        }

        if (!owner) {
          owner = getOwnerFromJQuery(this) || findOwnerAtCreationTime();
        }

        if (owner) {
          if (typeof content === 'string') {
            content = $(content);
            args[0] = content;
          }
          applyOwnership(content, owner);
        }
      }
      // @ts-expect-error apply
      return originalAppend.apply(this, args);
    };

    $.fn.appendTo = function (this, ...args) {
      if (isTargetContainer($(args[0] as JQuery<HTMLElement>))) {
        const owner = getOwnerFromJQuery(this as JQuery<HTMLElement>) || findOwnerAtCreationTime();
        if (owner) {
          applyOwnership(this, owner);
        }
      }
      return originalAppendTo.apply(this, args);
    };

    $.fn.on = function (this, ...args) {
      // @ts-expect-error apply
      if (!this.length) return originalOn.apply(this, args);

      const first = this[0] as HTMLElement;
      if (first.tagName && IGNORED_TAGS_SET.has(first.tagName.toUpperCase())) {
        // @ts-expect-error apply
        return originalOn.apply(this, args);
      }

      if (elementOwnerMap.has(first)) {
        // @ts-expect-error apply
        return originalOn.apply(this, args);
      }

      const owner = getOwnerFromJQuery(this) || findOwnerAtCreationTime();
      if (owner) {
        for (let i = 0; i < this.length; i++) {
          // @ts-expect-error apply
          if (this[i]) applyOwnership(this[i], owner);
        }
      }

      // @ts-expect-error apply
      return originalOn.apply(this, args);
    };

    // Bounce lateloaders
    const scheduleCleanup = () => {
      if (cleanupTimer) clearTimeout(cleanupTimer);
      cleanupTimer = window.setTimeout(restoreOriginals, LATELOADER_LEEWAY_MS);
    };

    const restoreOriginals = () => {
      $.fn.on = originalOn;
      // @ts-expect-error exists
      $.fn.init = originalInit;
      eventSource.removeListener(
        DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED,
        scheduleCleanup,
      );
    };

    scheduleCleanup();

    eventSource.on(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED, scheduleCleanup);
  } catch (error) {
    console.error('Failed to Hijack jQuery HTML Method:', error);
  }
};

function* extensionCloningGenerator(
  containers: HTMLElement[],
): Generator<JQuery<Element>, void, unknown> {
  const allChildren = containers.flatMap((container) =>
    Array.from(container.children),
  );

  for (const elem of allChildren) {
    try {
      const original = $(elem);

      const clone = original.clone(true, true);
      clone.find('.inline-drawer-content').css('display', 'block');

      yield clone;
    } catch (e) {
      console.warn('Failed to clone extension element, using fallback:', e);
      yield $(elem.cloneNode(true) as Element);
    }
  }
}

export const poolDOMExtensions = async () => {
  let observer: MutationObserver | null = null;
  let debounceTimer: number | null = null;
  window.discordia.extensionTemplates = [];

  const captureExtensions = async () => {
    try {
      const containers = getContainers();
      if (containers.length === 0) return;

      const generator = extensionCloningGenerator(containers);
      const cloned = await runTaskInIdle(generator);

      window.discordia.extensionTemplates = cloned;

      eventSource.emit(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED);
    } catch (error) {
      console.error('Failed to Capture Extension Settings:', error);
    }
  };

  const debouncedCapture = () => {
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      captureExtensions();
      debounceTimer = null;
    }, 100);
  };

  const startObserving = () => {
    eventSource.emit(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED);

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
      eventSource.emit(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED);
    }, LATELOADER_LEEWAY_MS);
  };

  captureExtensions();
  // SillyTavern fires this after extensions are loaded
  // Start Observing for lateloaders
  eventSource.on(event_types.EXTENSION_SETTINGS_LOADED, startObserving);
};
