/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';

export interface MockImportsOptions {
  '@script'?: Record<string, any>;
  '@scripts/utils'?: Record<string, any>;
  '@scripts/chats'?: Record<string, any>;
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
};

export const resetMockImports = () => {
  mockModules['@script'] = {
    messageEdit: vi.fn(),
    deleteMessage: vi.fn(),
    selectedGroup: null,
    characters: [],
    you: { name: 'User' },
  };
  mockModules['@scripts/utils'] = {
    escapeHtml: vi.fn((str: string) => str),
    getCharacterFolder: vi.fn(),
  };
  mockModules['@scripts/chats'] = {
    save: vi.fn(),
  };
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
  resetMockImports();
  (globalThis as any).imports = createMockImports();
  return (globalThis as any).imports;
};
