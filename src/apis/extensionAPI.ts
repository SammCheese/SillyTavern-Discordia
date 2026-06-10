import { createElement, type ReactNode } from 'react';
import imports from '../import';
import { DISCORDIA_EVENTS } from '../events/eventTypes';
import { addPatch, getPatches, removePatch, type Patch } from '../patches';
import { dislog } from '../utils/logger';

export const DISCORDIA_API_VERSION = '1.0.0' as const;
export type DiscordiaAPIVersionRange = string;
type DiscordiaEventName = string;
type DiscordiaEventCallback = (payload: unknown) => void;

type ModalController = {
  open: (modal: ReactNode) => number;
  close: (id?: number) => void;
  closeAll: () => void;
};

type PageController = {
  open: (page: ReactNode) => void;
  close: (onClose?: () => void) => void;
};

type PopupController = {
  open: (popup: ReactNode, options?: unknown) => void;
  close: () => void;
};

type DiscordiaRenderable = string | HTMLElement | ReactNode;

type ExtensionSetupContext = {
  api: DiscordiaAPIv1;
  manifest: DiscordiaExtensionManifest;
  storage: DiscordiaStorageNamespace;
  logger: {
    log: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
    important: (...args: unknown[]) => void;
    custom: (heading: string, ...args: unknown[]) => void;
  };
};

type ExtensionSetup = (
  context: ExtensionSetupContext,
) => void | (() => void) | Promise<void | (() => void)>;

type RegisteredExtension = {
  manifest: DiscordiaExtensionManifest;
  cleanup?: () => void;
};

type CommandHandler = (payload?: unknown) => unknown | Promise<unknown>;

export interface DiscordiaExtensionManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
}

export interface DiscordiaStorageNamespace {
  get<T = unknown>(key: string, fallback?: T): T | undefined;
  set<T = unknown>(key: string, value: T): void;
  remove(key: string): void;
  keys(): string[];
  clear(): void;
}

export interface DiscordiaAPIv1 {
  version: typeof DISCORDIA_API_VERSION;
  ready: Promise<void>;
  capabilities: Record<string, true>;

  supports(capability: string): boolean;

  events: {
    on(event: DiscordiaEventName, callback: DiscordiaEventCallback): () => void;
    once(
      event: DiscordiaEventName,
      callback: DiscordiaEventCallback,
    ): () => void;
    off(event: DiscordiaEventName, callback: DiscordiaEventCallback): void;
    emit(event: DiscordiaEventName, payload?: unknown): void;
  };

  logger: {
    log: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
    important: (...args: unknown[]) => void;
    custom: (heading: string, ...args: unknown[]) => void;
  };

  ui: {
    modal: {
      open(content: DiscordiaRenderable): number;
      close(id?: number): void;
      closeAll(): void;
    };
    modals: {
      open(content: DiscordiaRenderable): number;
      close(id?: number): void;
      closeAll(): void;
    };
    page: {
      open(content: DiscordiaRenderable): void;
      close(onClose?: () => void): void;
    };
    pages: {
      open(content: DiscordiaRenderable): void;
      close(onClose?: () => void): void;
    };
    popup: {
      open(content: DiscordiaRenderable, options?: unknown): void;
      close(): void;
    };
    popups: {
      open(content: DiscordiaRenderable, options?: unknown): void;
      close(): void;
    };
    toast: {
      success(message: string, title?: string): void;
      error(message: string, title?: string): void;
      warning(message: string, title?: string): void;
      info(message: string, title?: string): void;
    };
  };

  storage: {
    namespace(scope: string): DiscordiaStorageNamespace;
  };

  commands: {
    register(name: string, handler: CommandHandler): () => void;
    unregister(name: string): void;
    invoke<T = unknown>(name: string, payload?: unknown): Promise<T>;
    has(name: string): boolean;
    list(): string[];
  };

  extensions: {
    register(
      manifest: DiscordiaExtensionManifest,
      setup: ExtensionSetup,
    ): Promise<void>;
    unregister(id: string): Promise<void>;
    list(): DiscordiaExtensionManifest[];
  };

  utils: {
    imports<T = unknown>(mod: string): Promise<T>;
  };

  patcher: {
    addPatch(patch: Patch): void;
    removePatch(name: string): void;
    listPatches(): Patch[];
  };
}

const DISCORDIA_READY_EVENT = 'discordia:ready';
const DISCORDIA_API_READY_EVENT = 'discordia:api-ready';

const eventTarget = new EventTarget();
const eventWrappers = new Map<
  string,
  Map<DiscordiaEventCallback, EventListener>
>();
const commandHandlers = new Map<string, CommandHandler>();
const extensionRegistry = new Map<string, RegisteredExtension>();
const discordiaEventNames = new Set(Object.values(DISCORDIA_EVENTS));

const CAPABILITIES: Record<string, true> = Object.freeze({
  'events.on': true,
  'events.once': true,
  'events.off': true,
  'events.emit': true,
  'ui.modal': true,
  'ui.page': true,
  'ui.popup': true,
  'ui.toast': true,
  'storage.namespace': true,
  'commands.register': true,
  'commands.invoke': true,
  'extensions.register': true,
  'patcher.add': true,
  'utils.imports': true,
});

let modalController: ModalController | null = null;
let pageController: PageController | null = null;
let popupController: PopupController | null = null;

let registered = false;
let readySignaled = false;
let scriptRuntimePromise: Promise<{
  eventSource?: { emit?: (...args: unknown[]) => void };
}> | null = null;

let resolveReady: (() => void) | null = null;
const readyPromise = new Promise<void>((resolve) => {
  resolveReady = resolve;
});

const getScriptRuntime = () => {
  if (!scriptRuntimePromise) {
    // @ts-expect-error -  cant really type this
    scriptRuntimePromise = imports('@script');
  }
  return scriptRuntimePromise;
};

const dispatchWindowEvent = (name: string, detail?: unknown) => {
  window.dispatchEvent(new CustomEvent(name, { detail }));
};

const ensureController = <T>(
  controller: T | null,
  name: 'modal' | 'page' | 'popup',
): controller is T => {
  if (controller) {
    return true;
  }

  dislog.warn(
    `[Discordia API] UI controller "${name}" is not ready yet. Await api.ready before using UI calls.`,
  );
  return false;
};

const toScopePrefix = (scope: string) =>
  `discordia.extension.${scope.replace(/[^a-zA-Z0-9._-]/g, '_')}.`;

const buildStorageNamespace = (scope: string): DiscordiaStorageNamespace => {
  const prefix = toScopePrefix(scope);

  return {
    get<T = unknown>(key: string, fallback?: T): T | undefined {
      try {
        const raw = localStorage.getItem(`${prefix}${key}`);
        if (raw === null) {
          return fallback;
        }
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    },
    set<T = unknown>(key: string, value: T): void {
      localStorage.setItem(`${prefix}${key}`, JSON.stringify(value));
    },
    remove(key: string): void {
      localStorage.removeItem(`${prefix}${key}`);
    },
    keys(): string[] {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keys.push(key.slice(prefix.length));
        }
      }
      return keys;
    },
    clear(): void {
      const keys = this.keys();
      keys.forEach((key) => localStorage.removeItem(`${prefix}${key}`));
    },
  };
};

const getEventWrapperMap = (eventName: string) => {
  const existing = eventWrappers.get(eventName);
  if (existing) {
    return existing;
  }

  const map = new Map<DiscordiaEventCallback, EventListener>();
  eventWrappers.set(eventName, map);
  return map;
};

const on = (event: DiscordiaEventName, callback: DiscordiaEventCallback) => {
  const wrappers = getEventWrapperMap(event);

  const listener: EventListener = (evt: Event) => {
    callback((evt as CustomEvent).detail);
  };

  wrappers.set(callback, listener);
  eventTarget.addEventListener(event, listener);

  return () => {
    eventTarget.removeEventListener(event, listener);
    wrappers.delete(callback);
  };
};

const once = (event: DiscordiaEventName, callback: DiscordiaEventCallback) => {
  const unsubscribe = on(event, (payload) => {
    callback(payload);
    unsubscribe();
  });

  return unsubscribe;
};

const off = (event: DiscordiaEventName, callback: DiscordiaEventCallback) => {
  const wrappers = eventWrappers.get(event);
  const listener = wrappers?.get(callback);

  if (!listener) {
    return;
  }

  eventTarget.removeEventListener(event, listener);
  wrappers?.delete(callback);
};

const emit = (event: DiscordiaEventName, payload?: unknown) => {
  eventTarget.dispatchEvent(new CustomEvent(event, { detail: payload }));

  if (discordiaEventNames.has(event)) {
    getScriptRuntime()!
      .then((script) => {
        script.eventSource?.emit?.(event, payload);
      })
      .catch((error) => {
        dislog.debug(
          '[Discordia API] Failed to bridge event to SillyTavern',
          error,
        );
      });
  }
};

const asReactNode = (content: DiscordiaRenderable): ReactNode => {
  if (typeof content === 'string') {
    return createElement(
      'div',
      { className: 'p-4 whitespace-pre-wrap' },
      content,
    );
  }

  if (content instanceof HTMLElement) {
    return createElement('div', {
      className: 'h-full w-full overflow-auto',
      dangerouslySetInnerHTML: { __html: content.outerHTML },
    });
  }

  return content;
};

const registerCommand = (name: string, handler: CommandHandler) => {
  if (!name.trim()) {
    throw new Error('Command name must be a non-empty string.');
  }

  if (commandHandlers.has(name)) {
    throw new Error(`Command "${name}" is already registered.`);
  }

  commandHandlers.set(name, handler);
  return () => {
    commandHandlers.delete(name);
  };
};

const unregisterCommand = (name: string) => {
  commandHandlers.delete(name);
};

const invokeCommand = async <T = unknown>(name: string, payload?: unknown) => {
  const handler = commandHandlers.get(name);
  if (!handler) {
    throw new Error(`Unknown command "${name}".`);
  }
  return (await handler(payload)) as T;
};

const scopedLogger = (scope: string) => ({
  log: (...args: unknown[]) => dislog.custom(scope, ...args),
  warn: (...args: unknown[]) => dislog.warn(`[${scope}]`, ...args),
  error: (...args: unknown[]) => dislog.error(`[${scope}]`, ...args),
  debug: (...args: unknown[]) => dislog.debug(`[${scope}]`, ...args),
  important: (...args: unknown[]) => dislog.important(`[${scope}]`, ...args),
  custom: (heading: string, ...args: unknown[]) =>
    dislog.custom(`${scope}/${heading}`, ...args),
});

const registerManagedExtension = async (
  manifest: DiscordiaExtensionManifest,
  setup: ExtensionSetup,
) => {
  if (!manifest.id?.trim()) {
    throw new Error('Extension manifest must include a non-empty id.');
  }

  if (extensionRegistry.has(manifest.id)) {
    throw new Error(`Extension "${manifest.id}" is already registered.`);
  }

  extensionRegistry.set(manifest.id, { manifest });

  try {
    const result = await setup({
      api: extensionApi,
      manifest,
      storage: buildStorageNamespace(manifest.id),
      logger: scopedLogger(manifest.id),
    });

    if (typeof result === 'function') {
      const extension = extensionRegistry.get(manifest.id);
      if (extension) {
        extension.cleanup = result;
      }
    }

    dislog.custom('API', `Registered extension: ${manifest.id}`);
  } catch (error) {
    extensionRegistry.delete(manifest.id);
    throw error;
  }
};

const unregisterManagedExtension = async (id: string) => {
  const extension = extensionRegistry.get(id);
  if (!extension) {
    return;
  }

  try {
    extension.cleanup?.();
  } finally {
    extensionRegistry.delete(id);
  }
};

const supports = (capability: string): boolean => capability in CAPABILITIES;

const modalApi = {
  open(content: DiscordiaRenderable) {
    if (!ensureController(modalController, 'modal')) {
      return -1;
    }
    return modalController.open(asReactNode(content));
  },
  close(id?: number) {
    if (!ensureController(modalController, 'modal')) {
      return;
    }
    modalController.close(id);
  },
  closeAll() {
    if (!ensureController(modalController, 'modal')) {
      return;
    }
    modalController.closeAll();
  },
};

const pageApi = {
  open(content: DiscordiaRenderable) {
    if (!ensureController(pageController, 'page')) {
      return;
    }
    pageController.open(asReactNode(content));
  },
  close(onClose?: () => void) {
    if (!ensureController(pageController, 'page')) {
      return;
    }
    pageController.close(onClose);
  },
};

const popupApi = {
  open(content: DiscordiaRenderable, options?: unknown) {
    if (!ensureController(popupController, 'popup')) {
      return;
    }
    popupController.open(asReactNode(content), options);
  },
  close() {
    if (!ensureController(popupController, 'popup')) {
      return;
    }
    popupController.close();
  },
};

export const extensionApi: DiscordiaAPIv1 = Object.freeze({
  version: DISCORDIA_API_VERSION,
  ready: readyPromise,
  capabilities: CAPABILITIES,

  supports,

  events: {
    on,
    once,
    off,
    emit,
  },

  logger: {
    log: dislog.log,
    warn: dislog.warn,
    error: dislog.error,
    debug: dislog.debug,
    important: dislog.important,
    custom: dislog.custom,
  },

  ui: {
    modal: modalApi,
    modals: modalApi,
    page: pageApi,
    pages: pageApi,
    popup: popupApi,
    popups: popupApi,
    toast: {
      success: (message: string, title?: string) =>
        toastr.success(message, title),
      error: (message: string, title?: string) => toastr.error(message, title),
      warning: (message: string, title?: string) =>
        toastr.warning(message, title),
      info: (message: string, title?: string) => toastr.info(message, title),
    },
  },

  storage: {
    namespace: buildStorageNamespace,
  },

  commands: {
    register: registerCommand,
    unregister: unregisterCommand,
    invoke: invokeCommand,
    has: (name: string) => commandHandlers.has(name),
    list: () => [...commandHandlers.keys()],
  },

  extensions: {
    register: registerManagedExtension,
    unregister: unregisterManagedExtension,
    list: () => [...extensionRegistry.values()].map((entry) => entry.manifest),
  },

  utils: {
    imports,
  },

  patcher: {
    addPatch,
    removePatch,
    listPatches: getPatches,
  },
});

const isV1Compatible = (versionRange?: DiscordiaAPIVersionRange) => {
  if (!versionRange || versionRange === '*' || versionRange === 'latest') {
    return true;
  }

  const normalized = versionRange.trim().toLowerCase().replace(/^[~^]/, '');

  return (
    normalized === '1' ||
    normalized === '1.x' ||
    normalized === '1.*' ||
    normalized === DISCORDIA_API_VERSION ||
    normalized.startsWith('1.')
  );
};

export const registerExtensionAPI = () => {
  if (registered) {
    return extensionApi;
  }

  window.discordia = window.discordia || {
    extensionTemplates: [],
    backups: {},
  };

  window.discordia.imports = imports;
  window.discordia.api = extensionApi;
  window.discordia.apis = {
    ...(window.discordia.apis || {}),
    v1: extensionApi,
  };

  window.discordia.getApi = (versionRange?: DiscordiaAPIVersionRange) => {
    if (isV1Compatible(versionRange)) {
      return extensionApi;
    }

    throw new Error(
      `No Discordia API found for version range "${versionRange}". Available: ${DISCORDIA_API_VERSION}`,
    );
  };

  dispatchWindowEvent(DISCORDIA_API_READY_EVENT, {
    apiVersion: DISCORDIA_API_VERSION,
    capabilities: CAPABILITIES,
  });

  registered = true;
  return extensionApi;
};

export const markDiscordiaReady = () => {
  if (readySignaled) {
    return;
  }

  readySignaled = true;
  resolveReady?.();

  dispatchWindowEvent(DISCORDIA_READY_EVENT, {
    apiVersion: DISCORDIA_API_VERSION,
  });
};

export const setDiscordiaModalController = (
  controller: ModalController | null,
) => {
  modalController = controller;
};

export const setDiscordiaPageController = (
  controller: PageController | null,
) => {
  pageController = controller;
};

export const setDiscordiaPopupController = (
  controller: PopupController | null,
) => {
  popupController = controller;
};

export default extensionApi;
