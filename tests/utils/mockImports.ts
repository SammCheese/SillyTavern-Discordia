/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';

export interface MockImportsOptions {
  '@script'?: Record<string, any>;
  '@scripts/utils'?: Record<string, any>;
  '@scripts/chats'?: Record<string, any>;
  '@scripts/extensions'?: Record<string, any>;
  [key: string]: Record<string, any> | undefined;
}
export const mockModules: Record<string, Record<string, any>> = {
  '@script': {
    messageEdit: vi.fn(),
    deleteMessage: vi.fn(),
    selectedGroup: null,
    characters: [],
    you: { name: 'User' },
  },
  '@scripts/utils': {
    escapeHtml: vi.fn((str: string) => str),
    getCharacterFolder: vi.fn(),
  },
  '@scripts/chats': {
    save: vi.fn(),
  },
  '@scripts/extensions': {
    extensionTypes: {
      'third-party/ExampleExtension': 'global',
    },
    extension_settings: {
      disabledExtensions: [],
    },
    enableExtension: vi.fn(),
    disableExtension: vi.fn(),
  },
};

export const createMockImports = () => {
  return vi.fn(async (mod: string) => {
    const mockModule = mockModules[mod];
    if (!mockModule) {
      console.warn(`No mock defined for imports('${mod}')`);
      return Promise.resolve({});
    }
    return Promise.resolve(mockModule);
  });
};

export const setupGlobalImports = () => {
  (globalThis as any).imports = createMockImports();
  (globalThis as any)._ = {
    debounce: (fn: (...args: unknown[]) => void) => fn,
  };
  (globalThis as any).toastr = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };
  (globalThis as any).SillyTavern = {
    getContext: () => ({
      imports: (globalThis as any).imports,
      saveSettingsDebounced: vi.fn(),
    }),
    libs: {
      jquery: {
        default: vi.fn(() => ({
          on: vi.fn(),
          off: vi.fn(),
          append: vi.fn(),
          find: vi.fn().mockReturnThis(),
          each: vi.fn().mockReturnThis(),
          css: vi.fn().mockReturnThis(),
        })),
      },
      lodash: {
        default: {
          debounce: (fn: any) => fn,
        },
      },
    },
  };
  return (globalThis as any).imports;
};

export default setupGlobalImports;
