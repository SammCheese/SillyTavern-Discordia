import { DISCORDIA_EVENTS } from '../events/eventTypes';
import { runTaskInIdle } from '../utils/utils';

const importPromise = imports('@script');

// Track load time
const timerStart = Date.now();

const TARGET_CONTAINER_IDS = ['extensions_settings', 'extensions_settings2'];
const FAST_FAIL_REGEX = /extensions\//;
const EXTENSION_NAME_REGEX =
  /extensions\/(?:third-party\/)?(?!(?:SillyTavern-Discordia|third-party)\/)([^/]+)\//;
// Blacklist known extensions without settings
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
const IGNORED_TAGS_SET = new Set([
  'BODY',
  'HTML',
  'HEAD',
  'SCRIPT',
  'HTMLDOCUMENT',
  'DOCUMENT',
  'IFRAME',
  'FRAME',
  'OBJECT',
  'EMBED',
  'VIDEO',
  'AUDIO',
  'CANVAS',
  'SVG',
]);
const LATELOADER_LEEWAY_MS = 30000;
// Limit performance impact by capping stack trace
Error.stackTraceLimit = 1;

// Caches
const MAX_CACHE_SIZE = 500;
const stackCache = new Map<string, string | null>();
const pendingStackMap = new WeakMap<Element, Error>();
const elementOwnerMap = new WeakMap<Element, string>();
const OWNER_SYMBOL = Symbol('discordia-owner');

let cachedContainers: HTMLElement[] = [];

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

const OWNER_ATTR = 'data-discordia-settings-owner';

const setOwnerOnDescendants = (root: Element, owner: string) => {
  if (elementOwnerMap.get(root) === owner) return;

  elementOwnerMap.set(root, owner);
  root.setAttribute(OWNER_ATTR, owner);
  pendingStackMap.delete(root);

  const descendants = root.querySelectorAll(`:not([${OWNER_ATTR}])`);
  for (let i = 0; i < descendants.length; i++) {
    descendants[i]?.setAttribute(OWNER_ATTR, owner);
    elementOwnerMap.set(descendants[i]!, owner);
  }
};

const applyOwnership = (
  element: HTMLElement | Element | JQuery,
  owner: string,
) => {
  try {
    if (element instanceof jQuery) {
      // @ts-expect-error exists
      for (let i = 0; i < element.length; i++) {
        const el = element[i];
        if (elementOwnerMap.get(el) === owner) return;

        elementOwnerMap.set(el, owner);
        el.setAttribute?.(OWNER_ATTR, owner);
        setOwnerOnDescendants(el, owner);
        pendingStackMap.delete(el);
      }
      element[OWNER_SYMBOL] = owner;
    } else if (element instanceof Element) {
      if (elementOwnerMap.get(element) === owner) return;

      elementOwnerMap.set(element, owner);
      element.setAttribute?.(OWNER_ATTR, owner);
      setOwnerOnDescendants(element, owner);
      pendingStackMap.delete(element);
    }
  } catch {
    // ignore
  }
};

const resolvePendingOwner = (element: Element): string | null => {
  if (pendingStackMap.has(element)) {
    const error = pendingStackMap.get(element)!;
    const owner = resolveStackToOwner(error);

    if (owner) {
      applyOwnership(element, owner);
      return owner;
    } else {
      pendingStackMap.delete(element);
    }
  }
  return null;
};

type OwnershipTarget = JQuery | Element | Element[] | NodeListOf<Element>;

type OwnershipJob = {
  targets: OwnershipTarget;
  ownerHint?: string | null;
  context?: string | Error | null;
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

    let owner = job.ownerHint ?? null;

    if (!owner && job.context) {
      owner =
        typeof job.context === 'string'
          ? job.context
          : resolveStackToOwner(job.context as Error);
    }

    const targets = normalizeTargets(job.targets);

    if (owner) {
      for (const target of targets) {
        applyOwnership(target as JQuery | Element, owner);
      }
      continue;
    }

    for (const target of targets) {
      const resolved =
        target instanceof jQuery
          ? getOwnerFromJQuery(target as JQuery)
          : getElementOwner(target as Element);

      if (resolved) {
        applyOwnership(target as JQuery | Element, resolved);
      }
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
        timeRemaining: () => 50, // 50ms Deadline
      });
    }, 10);
  }
};

const enqueueOwnershipJob = (job: OwnershipJob) => {
  ownershipQueue.push(job);
  scheduleOwnershipProcessing();
};

const captureCreationContext = (): string | Error | null => {
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

  return new Error();
};

export const getElementOwner = (element: Element): string | null => {
  if (elementOwnerMap.has(element)) return elementOwnerMap.get(element)!;

  const resolved = resolvePendingOwner(element);
  if (resolved) return resolved;

  const attr = element.getAttribute?.(OWNER_ATTR);
  if (attr) {
    elementOwnerMap.set(element, attr);
    return attr;
  }

  let parent = element.parentElement;
  while (parent) {
    if (elementOwnerMap.has(parent)) {
      const owner = elementOwnerMap.get(parent)!;
      element.setAttribute?.(OWNER_ATTR, owner);
      elementOwnerMap.set(element, owner);
      return owner;
    }
    const parentAttr = parent.getAttribute?.(OWNER_ATTR);
    if (parentAttr) {
      element.setAttribute?.(OWNER_ATTR, parentAttr);
      elementOwnerMap.set(element, parentAttr);
      return parentAttr;
    }
    parent = parent.parentElement;
  }

  return null;
};

export const getOwnerFromJQuery = ($el: JQuery): string | null => {
  if ($el[OWNER_SYMBOL]) return $el[OWNER_SYMBOL];

  const len = Math.min($el.length, 5);
  for (let i = 0; i < len; i++) {
    const el = $el[i] as Element;
    const owner = getElementOwner(el);
    if (owner) {
      $el[OWNER_SYMBOL] = owner;
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
    if (node?.id && TARGET_CONTAINER_IDS.includes(node?.id)) return true;

    const containers = getContainers();
    for (let i = 0; i < containers.length; i++) {
      if (containers[i]?.contains(node ?? null)) return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const hijackJquery = () => {
  try {
    const originalAppend = $.fn.append;
    const originalAppendTo = $.fn.appendTo;
    const originalOn = $.fn.on;
    let cleanupTimer: number | null = null;

    // @ts-expect-error exists
    $.fn.init.prototype = $.fn;

    $.fn.append = function (this, ...args) {
      // @ts-expect-error apply
      if (!this.length) return originalAppend.apply(this, args);

      const isTarget = isTargetContainer(this);

      if (!isTarget)
        // @ts-expect-error apply
        return originalAppend.apply(this, args);

      let content = args[0];
      let owner: string | null = null;
      let ctx: string | Error | null = null;

      if (content instanceof jQuery) {
        owner = getOwnerFromJQuery(content as JQuery<HTMLElement>);
      }

      const parent = this[0] as HTMLElement;

      if (!owner) {
        if (elementOwnerMap.has(parent)) {
          owner = elementOwnerMap.get(parent)!;
        } else if (pendingStackMap.has(parent)) {
          ctx = pendingStackMap.get(parent)!;
        } else {
          ctx = captureCreationContext();
          owner = typeof ctx === 'string' ? ctx : null;
        }
      }

      if (typeof content === 'string') {
        content = $(content);
        args[0] = content;
      }

      // @ts-expect-error apply
      const result = originalAppend.apply(this, args);

      if (content) {
        enqueueOwnershipJob({
          targets: content as OwnershipTarget,
          ownerHint: owner,
          context: owner ? null : ctx,
        });
      }

      return result;
    };

    $.fn.appendTo = function (this, ...args) {
      const destArg = args[0];
      const destination =
        destArg instanceof jQuery ? destArg : $(destArg as HTMLElement);
      const isTarget = isTargetContainer(destination as JQuery<HTMLElement>);

      if (!isTarget) return originalAppendTo.apply(this, args);

      let owner = isTarget ? getOwnerFromJQuery(this) : null;
      let ctx: string | Error | null = null;

      const parent = destination[0] as HTMLElement;
      if (!owner) {
        if (elementOwnerMap.has(parent)) {
          owner = elementOwnerMap.get(parent)!;
        } else if (pendingStackMap.has(parent)) {
          ctx = pendingStackMap.get(parent)!;
        } else {
          ctx = captureCreationContext();
          owner = typeof ctx === 'string' ? ctx : null;
        }
      }

      const result = originalAppendTo.apply(this, args);

      enqueueOwnershipJob({
        targets: this as OwnershipTarget,
        ownerHint: owner,
        context: owner ? null : ctx,
      });

      return result;
    };

    $.fn.on = function (this, ...args) {
      // @ts-expect-error apply
      if (!this.length) return originalOn.apply(this, args);
      const first = this[0] as HTMLElement;

      if (first.tagName && IGNORED_TAGS_SET.has(first.tagName.toUpperCase())) {
        // @ts-expect-error apply
        return originalOn.apply(this, args);
      }

      if (this[OWNER_SYMBOL] || elementOwnerMap.has(first)) {
        const owner = getOwnerFromJQuery(this);
        if (owner) {
          for (let i = 0; i < this.length; i++) {
            // @ts-expect-error apply
            if (this[i]) applyOwnership(this[i], owner);
          }
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

    const restoreOriginals = async () => {
      $.fn.on = originalOn;
      $.fn.append = originalAppend;
      $.fn.appendTo = originalAppendTo;

      const { eventSource } = await importPromise;

      eventSource.removeListener(
        DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED,
        scheduleCleanup,
      );
      stackCache.clear();
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
      const child = children[i]!;
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
    'Cloning',
    allChildren.length,
    'direct children from containers',
  );

  for (const elem of allChildren) {
    try {
      const original = $(elem) as JQuery<HTMLElement>;
      getOwner(original);
      const clone = original.clone(true, true);

      // Force visibility
      clone.find('.inline-drawer-content').css('display', 'block');

      yield clone;
    } catch (e) {
      dislog.warn('Failed to clone extension element, using fallback:', e);
      yield $(elem.cloneNode(true) as Element);
    }
  }
}

export const poolDOMExtensions = async () => {
  const { eventSource, event_types } = await importPromise;
  let observer: MutationObserver | null = null;
  let debounceTimer: number | null = null;
  window.discordia.extensionTemplates = [];

  const captureExtensions = async () => {
    try {
      const containers = getContainers();
      if (containers.length === 0) return;

      resolveAllOwnership(containers);

      const generator = extensionCloningGenerator(containers);
      const cloned = await runTaskInIdle(generator);

      window.discordia.extensionTemplates = cloned;

      // Mobile has this wonderful issue where off-spec elements nuke their children
      const isCoping = cloned.some(
        (c) => c.length > 0 && c[0]?.childNodes.length === 0 && c[0]?.innerHTML,
      );
      if (isCoping) {
        dislog.warn(
          'Some elements lost children, this may affect mobile rendering',
        );
      }

      eventSource.emit(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED);
    } catch (error) {
      dislog.error('Failed to Capture Extension Settings:', error);
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
        idleCapture,
      );
      eventSource.emit(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED);
    }, LATELOADER_LEEWAY_MS);
  };

  captureExtensions();

  const idleCapture = () => {
    dislog.log('Completed Load in ' + (Date.now() - timerStart) + 'ms');
    // We are out of the critical loading phase
    // Bounce back tracelimit to not interfere with other extensions debugging
    Error.stackTraceLimit = 10;

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(
        () => {
          captureExtensions();
          startObserving();
        },
        { timeout: 1000 },
      );
    } else {
      // polyfill
      setTimeout(() => {
        captureExtensions();
        startObserving();
      }, 100);
    }
  };

  // SillyTavern fires this after extensions are loaded
  // Start Observing for lateloaders
  eventSource.on(event_types.EXTENSION_SETTINGS_LOADED, idleCapture);
};
