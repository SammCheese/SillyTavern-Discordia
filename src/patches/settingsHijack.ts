import { DISCORDIA_EVENTS } from '../events/eventTypes';
import { runTaskInIdle } from '../utils/utils';

const importPromise = imports('@script');

const timerStart = Date.now();

const TARGET_CONTAINER_IDS = ['extensions_settings', 'extensions_settings2'];
const EXTENSION_NAME_REGEX =
  /extensions\/(?:third-party\/)?(?!(?:SillyTavern-Discordia|third-party)\/)([^/]+)\//i;
const FAST_FAIL_REGEX = /extensions\//i;
const EXTENSION_NAME_NEGLECT_SET = new Set([
  'SillyTavern-Discordia',
  'SillyTavern-ChatPlus',
  'SillyTavern-CssSnippets',
  'SillyTavern-TopInfoBar',
  'SillyTavern-ImageMetadataViewer',
  'Extension-CodeRunner',
  'gallery',
  'quick-reply',
  'attachments',
  'connection-manager',
  'token-counter',
  'sorcery',
]);

const OWNER_ATTR = 'data-discordia-settings-owner';

const LATELOADER_LEEWAY_MS = 40000;
const DEBOUNCE_DELAY_MS = 300;
const MAX_CACHE_SIZE = 500;

const stackCache = new Map<string, string | null>();
const elementOwnerMap = new WeakMap<Element, string>();

let cachedContainers: HTMLElement[] = [];
let activeOwner: string | null = null;

type RestoreFn = () => void;
const restoreFns: RestoreFn[] = [];

const getContainers = (): HTMLElement[] => {
  if (cachedContainers.length < TARGET_CONTAINER_IDS.length) {
    cachedContainers = TARGET_CONTAINER_IDS.map((id) =>
      document.getElementById(id),
    ).filter(Boolean) as HTMLElement[];
  }
  return cachedContainers;
};

const resolveStackToOwner = (error: Error): string | null => {
  const stackString = error.stack || '';
  if (!stackString) return null;

  if (stackCache.has(stackString)) {
    return stackCache.get(stackString)!;
  }

  if (stackCache.size > MAX_CACHE_SIZE) {
    stackCache.clear();
  }

  if (!FAST_FAIL_REGEX.test(stackString)) {
    stackCache.set(stackString, null);
    return null;
  }

  const match = EXTENSION_NAME_REGEX.exec(stackString);
  if (match?.[1] && !EXTENSION_NAME_NEGLECT_SET.has(match[1])) {
    stackCache.set(stackString, match[1]);
    return match[1];
  }

  stackCache.set(stackString, null);
  return null;
};

const getOwnerFromCurrentScript = (): string | null => {
  const currentScript = document.currentScript as HTMLScriptElement | null;
  const src = currentScript?.src;
  if (!src) return null;

  const match = EXTENSION_NAME_REGEX.exec(src);
  if (match?.[1] && !EXTENSION_NAME_NEGLECT_SET.has(match[1])) {
    return match[1];
  }

  return null;
};

const getRuntimeOwnerHint = (allowStackFallback = false): string | null => {
  if (activeOwner) return activeOwner;

  const currentScriptOwner = getOwnerFromCurrentScript();
  if (currentScriptOwner) return currentScriptOwner;

  if (!allowStackFallback) return null;

  return resolveStackToOwner(new Error());
};

const runWithOwner = <T>(owner: string | null, fn: () => T): T => {
  const prev = activeOwner;
  activeOwner = owner;
  try {
    return fn();
  } finally {
    activeOwner = prev;
  }
};

const isJQueryObject = (value: unknown): value is JQuery => {
  return value instanceof jQuery;
};

const invokeJquery = <T>(fn: unknown, ctx: unknown, args: unknown[]): T => {
  return Reflect.apply(
    fn as (this: unknown, ...innerArgs: unknown[]) => T,
    ctx,
    args,
  );
};

const patchRuntimeContext = () => {
  const originalSetTimeout = window.setTimeout.bind(window);
  const originalQueueMicrotask = window.queueMicrotask?.bind(window);
  const originalRaf = window.requestAnimationFrame?.bind(window);
  const originalRic = window.requestIdleCallback?.bind(window);

  window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args) => {
    const owner = getRuntimeOwnerHint(false);

    if (typeof handler !== 'function') {
      return originalSetTimeout(handler, timeout, ...args);
    }

    const wrapped = function (this: unknown, ...cbArgs: unknown[]) {
      return runWithOwner(owner, () =>
        (handler as (...innerArgs: unknown[]) => unknown).apply(this, cbArgs),
      );
    };

    return originalSetTimeout(wrapped as TimerHandler, timeout, ...args);
  }) as typeof window.setTimeout;

  restoreFns.push(() => {
    window.setTimeout = originalSetTimeout;
  });

  if (originalQueueMicrotask) {
    window.queueMicrotask = ((callback: VoidFunction) => {
      const owner = getRuntimeOwnerHint(false);
      originalQueueMicrotask(() => {
        runWithOwner(owner, callback);
      });
    }) as typeof window.queueMicrotask;

    restoreFns.push(() => {
      window.queueMicrotask = originalQueueMicrotask;
    });
  }

  if (originalRaf) {
    window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      const owner = getRuntimeOwnerHint(false);
      return originalRaf((ts: DOMHighResTimeStamp) => {
        runWithOwner(owner, () => callback(ts));
      });
    }) as typeof window.requestAnimationFrame;

    restoreFns.push(() => {
      window.requestAnimationFrame = originalRaf;
    });
  }

  if (originalRic) {
    window.requestIdleCallback = ((
      callback: IdleRequestCallback,
      options?: IdleRequestOptions,
    ) => {
      const owner = getRuntimeOwnerHint(false);
      return originalRic((deadline: IdleDeadline) => {
        runWithOwner(owner, () => callback(deadline));
      }, options);
    }) as typeof window.requestIdleCallback;

    restoreFns.push(() => {
      window.requestIdleCallback = originalRic;
    });
  }
};

const markOwned = (element: Element, owner: string) => {
  if (!owner) return;
  if (elementOwnerMap.get(element) === owner) return;

  elementOwnerMap.set(element, owner);
  element.setAttribute?.(OWNER_ATTR, owner);
};

const applyOwnership = (
  element: HTMLElement | Element | JQuery,
  owner: string,
) => {
  try {
    if (isJQueryObject(element)) {
      for (let i = 0; i < element.length; i++) {
        const el = element[i] as Element | undefined;
        if (el) markOwned(el, owner);
      }
      return;
    }

    if (element instanceof Element) {
      markOwned(element, owner);
    }
  } catch {
    // ignore
  }
};

export const getElementOwner = (element: Element): string | null => {
  if (elementOwnerMap.has(element)) return elementOwnerMap.get(element)!;

  const attr = element.getAttribute?.(OWNER_ATTR);
  if (attr) {
    elementOwnerMap.set(element, attr);
    return attr;
  }

  let parent = element.parentElement;
  while (parent) {
    if (elementOwnerMap.has(parent)) {
      const owner = elementOwnerMap.get(parent)!;
      markOwned(element, owner);
      return owner;
    }

    const parentAttr = parent.getAttribute?.(OWNER_ATTR);
    if (parentAttr) {
      markOwned(element, parentAttr);
      return parentAttr;
    }

    parent = parent.parentElement;
  }

  return null;
};

export const getOwnerFromJQuery = ($el: JQuery): string | null => {
  const len = Math.min($el.length, 5);
  for (let i = 0; i < len; i++) {
    const el = $el[i] as Element;
    const owner = getElementOwner(el);
    if (owner) {
      return owner;
    }
  }

  return null;
};

export const getOwner = (target: JQuery | Element | string): string | null => {
  try {
    if (typeof target === 'string') target = $(target);
    if (target instanceof jQuery)
      return getOwnerFromJQuery(target as JQuery<HTMLElement>);
    if (target instanceof Element) return getElementOwner(target);
  } catch (e) {
    dislog.error('getOwner error:', e);
  }
  return null;
};

const isTargetContainer = (target: JQuery<HTMLElement>): boolean => {
  try {
    if (!target.length) return false;
    const node = target[0];
    if (node?.id && TARGET_CONTAINER_IDS.includes(node.id)) return true;

    const containers = getContainers();
    for (let i = 0; i < containers.length; i++) {
      if (containers[i]?.contains(node ?? null)) return true;
    }

    return false;
  } catch {
    return false;
  }
};

type OwnershipTarget = JQuery | Element | Element[] | NodeListOf<Element>;
type OwnershipJob = {
  targets: OwnershipTarget;
  ownerHint?: string | null;
};

const ownershipQueue: OwnershipJob[] = [];
let ownershipIdleHandle: number | null = null;

const normalizeTargets = (targets: OwnershipTarget): (JQuery | Element)[] => {
  if (targets instanceof jQuery) return [targets] as JQuery[];
  if (targets instanceof Element) return [targets];
  if (Array.isArray(targets)) return targets;
  return Array.from(targets);
};

const processQueue = (deadline: IdleDeadline) => {
  ownershipIdleHandle = null;

  while (ownershipQueue.length > 0 && deadline.timeRemaining() > 1) {
    const job = ownershipQueue.shift();
    if (!job) break;

    const targets = normalizeTargets(job.targets);
    const owner = job.ownerHint ?? getRuntimeOwnerHint(false);

    if (!owner) {
      for (const target of targets) {
        const resolved =
          target instanceof jQuery
            ? getOwnerFromJQuery(target as JQuery)
            : getElementOwner(target as Element);
        if (resolved) applyOwnership(target as JQuery | Element, resolved);
      }
      continue;
    }

    for (const target of targets) {
      applyOwnership(target as JQuery | Element, owner);
    }
  }

  if (ownershipQueue.length > 0) scheduleOwnershipProcessing();
};

const scheduleOwnershipProcessing = () => {
  if (ownershipIdleHandle !== null) return;

  if (typeof requestIdleCallback !== 'undefined') {
    ownershipIdleHandle = requestIdleCallback(processQueue, { timeout: 1000 });
  } else {
    ownershipIdleHandle = window.setTimeout(() => {
      processQueue({
        didTimeout: false,
        timeRemaining: () => 50,
      });
    }, 10);
  }
};

const enqueueOwnershipJob = (job: OwnershipJob) => {
  ownershipQueue.push(job);
  scheduleOwnershipProcessing();
};

const guessOwnerForInsert = (
  parent: Element,
  content: JQuery | Element | null,
) => {
  if (isJQueryObject(content)) {
    const existing = getOwnerFromJQuery(content);
    if (existing) return existing;
  } else if (content instanceof Element) {
    const existing = getElementOwner(content);
    if (existing) return existing;
  }

  const parentOwner = getElementOwner(parent);
  if (parentOwner) return parentOwner;

  return getRuntimeOwnerHint(true);
};

export const hijackJquery = () => {
  try {
    patchRuntimeContext();

    const originalAppend = $.fn.append;
    const originalAppendTo = $.fn.appendTo;
    const originalPrepend = $.fn.prepend;
    const originalPrependTo = $.fn.prependTo;
    // @ts-expect-error exists
    const originalInit = $.fn.init.prototype;
    let cleanupTimer: number | null = null;

    // @ts-expect-error exists
    $.fn.init.prototype = $.fn;

    $.fn.append = function (this, ...args) {
      // @ts-expect-error apply
      if (!this.length) return originalAppend.apply(this, args);
      if (!isTargetContainer(this)) {
        // @ts-expect-error apply
        return originalAppend.apply(this, args);
      }

      let content = args[0] as JQuery | Element | string | undefined;
      if (typeof content === 'string') {
        content = $(content);
        args[0] = content;
      }

      const parent = this[0] as HTMLElement;
      const owner = guessOwnerForInsert(
        parent,
        (content as JQuery | Element | null) ?? null,
      );

      const result = runWithOwner(owner, () =>
        invokeJquery<JQuery>(originalAppend, this, args),
      );

      if (content) {
        enqueueOwnershipJob({
          targets: content as OwnershipTarget,
          ownerHint: owner,
        });
      }

      return result;
    };

    $.fn.prepend = function (this, ...args) {
      // @ts-expect-error apply
      if (!this.length) return originalPrepend.apply(this, args);
      if (!isTargetContainer(this)) {
        // @ts-expect-error apply
        return originalPrepend.apply(this, args);
      }

      let content = args[0] as JQuery | Element | string | undefined;
      if (typeof content === 'string') {
        content = $(content);
        args[0] = content;
      }

      const parent = this[0] as HTMLElement;
      const owner = guessOwnerForInsert(
        parent,
        (content as JQuery | Element | null) ?? null,
      );

      const result = runWithOwner(owner, () =>
        invokeJquery<JQuery>(originalPrepend, this, args),
      );

      if (content) {
        enqueueOwnershipJob({
          targets: content as OwnershipTarget,
          ownerHint: owner,
        });
      }

      return result;
    };

    $.fn.appendTo = function (this, ...args) {
      const destArg = args[0];
      const destination =
        destArg instanceof jQuery ? destArg : $(destArg as HTMLElement);
      if (!isTargetContainer(destination as JQuery<HTMLElement>)) {
        return originalAppendTo.apply(this, args);
      }

      const parent = destination[0] as HTMLElement;
      const owner = guessOwnerForInsert(parent, this as JQuery);

      const result = runWithOwner(owner, () =>
        originalAppendTo.apply(this, args),
      );

      enqueueOwnershipJob({
        targets: this as OwnershipTarget,
        ownerHint: owner,
      });

      return result;
    };

    $.fn.prependTo = function (this, ...args) {
      const destArg = args[0];
      const destination =
        destArg instanceof jQuery ? destArg : $(destArg as HTMLElement);
      if (!isTargetContainer(destination as JQuery<HTMLElement>)) {
        return originalPrependTo.apply(this, args);
      }

      const parent = destination[0] as HTMLElement;
      const owner = guessOwnerForInsert(parent, this as JQuery);

      const result = runWithOwner(owner, () =>
        originalPrependTo.apply(this, args),
      );

      enqueueOwnershipJob({
        targets: this as OwnershipTarget,
        ownerHint: owner,
      });

      return result;
    };

    const scheduleCleanup = () => {
      if (cleanupTimer) clearTimeout(cleanupTimer);
      cleanupTimer = window.setTimeout(restoreOriginals, LATELOADER_LEEWAY_MS);
    };

    const restoreOriginals = async () => {
      $.fn.append = originalAppend;
      $.fn.appendTo = originalAppendTo;
      $.fn.prepend = originalPrepend;
      $.fn.prependTo = originalPrependTo;
      // @ts-expect-error exists
      $.fn.init.prototype = originalInit;

      stackCache.clear();

      while (restoreFns.length) {
        const restore = restoreFns.pop();
        try {
          restore?.();
        } catch {
          // ignore
        }
      }

      try {
        const { eventSource } = await importPromise;
        eventSource.removeListener(
          DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED,
          scheduleCleanup,
        );
      } catch (error) {
        dislog.error('Failed to Restore Original jQuery Methods:', error);
      }
    };

    scheduleCleanup();
    importPromise.then(({ eventSource }) => {
      eventSource.on(
        DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED,
        scheduleCleanup,
      );
    });
  } catch (error) {
    dislog.error('Failed to Hijack jQuery HTML Method:', error);
  }
};

const resolveAllOwnership = (containers: HTMLElement[]): void => {
  for (const container of containers) {
    const children = container.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as Element;
      getOwner(child);

      const drawers = child.querySelectorAll('.inline-drawer-content');
      for (let j = 0; j < drawers.length; j++) {
        getOwner(drawers[j] as Element);
      }
    }
  }
};

function* extensionCloningGenerator(
  containers: HTMLElement[],
): Generator<JQuery<Element>, void, unknown> {
  const allChildren = containers.flatMap((container) =>
    Array.from(container.children),
  );

  dislog.debug(
    'Hijack: Cloning',
    allChildren.length,
    'direct children from containers',
  );

  for (const elem of allChildren) {
    try {
      const original = $(elem) as JQuery<HTMLElement>;
      getOwner(original);
      const clone = original.clone(true, true) as JQuery<HTMLElement>;

      const interactiveSelector =
        'input, select, textarea, button, a, label, [contenteditable="true"]';

      const nodeMap = new WeakMap<Element, Element>();
      const originalInputs = original.find(interactiveSelector).toArray();
      const cloneInputs = clone.find(interactiveSelector).toArray();

      for (let i = 0; i < cloneInputs.length; i++) {
        if (originalInputs[i] && cloneInputs[i]) {
          nodeMap.set(cloneInputs[i] as Element, originalInputs[i] as Element);
        }
      }

      clone.on('input change click', interactiveSelector, function (e) {
        const targetOriginal = nodeMap.get(this);
        if (!targetOriginal) return;

        if (e.type === 'click') {
          $(targetOriginal).trigger('click');
          return;
        }

        if (this.type === 'checkbox' || this.type === 'radio') {
          (targetOriginal as HTMLInputElement).checked = (
            this as HTMLInputElement
          ).checked;
        } else {
          (targetOriginal as HTMLInputElement).value = (
            this as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          ).value;
        }

        $(targetOriginal).trigger(e.type);
      });

      clone.find('.inline-drawer-content').css('display', 'block');

      yield clone;
    } catch (e) {
      dislog.warn('Hijack: clone failed, using fallback:', e);
      yield $(elem.cloneNode(true) as Element);
    }
  }
}

export const poolDOMExtensions = async () => {
  const { eventSource, event_types } = await importPromise;
  let observer: MutationObserver | null = null;
  let debounceTimer: number | null = null;
  let hasObservedNewNodes = false;
  let hasCapturedOnce = false;

  window.discordia.extensionTemplates = [];

  const captureExtensions = async (force = false) => {
    try {
      const containers = getContainers();
      if (containers.length === 0) return;

      if (!force && hasCapturedOnce && !hasObservedNewNodes) return;

      resolveAllOwnership(containers);

      const generator = extensionCloningGenerator(containers);
      const cloned = await runTaskInIdle(generator);

      window.discordia.extensionTemplates = cloned;
      hasCapturedOnce = true;
      hasObservedNewNodes = false;

      eventSource.emit(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED);
    } catch (error) {
      dislog.error('Failed to capture extension settings:', error);
    }
  };

  const debouncedCapture = () => {
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      captureExtensions();
      debounceTimer = null;
    }, DEBOUNCE_DELAY_MS);
  };

  const startObserving = () => {
    eventSource.emit(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED);

    const containers = getContainers();
    if (containers.length === 0) return;

    observer = new MutationObserver((mutations) => {
      if (
        mutations.some(
          (m) => m.addedNodes.length > 0 || m.removedNodes.length > 0,
        )
      ) {
        hasObservedNewNodes = true;

        for (const mutation of mutations) {
          if (!mutation.addedNodes?.length) continue;

          const parentOwner = getElementOwner(mutation.target as Element);
          if (!parentOwner) continue;

          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            markOwned(node, parentOwner);
          });
        }

        debouncedCapture();
      }
    });

    for (const container of containers) {
      observer.observe(container, {
        childList: true,
        subtree: true,
      });
    }

    setTimeout(() => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      eventSource.removeListener(
        event_types.EXTENSION_SETTINGS_LOADED,
        idleCapture,
      );

      eventSource.emit(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED);
    }, LATELOADER_LEEWAY_MS);
  };

  captureExtensions(true);

  const idleCapture = () => {
    dislog.log('Hijack completed load in ' + (Date.now() - timerStart) + 'ms');

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(
        () => {
          captureExtensions(true);
          startObserving();
        },
        { timeout: 1000 },
      );
    } else {
      setTimeout(() => {
        captureExtensions(true);
        startObserving();
      }, 100);
    }
  };

  eventSource.on(event_types.EXTENSION_SETTINGS_LOADED, idleCapture);
};
