import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('index entry', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = '';
    window.discordia = {};
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates root container, hides top bar, and applies patches on initial mount', async () => {
    const host = document.createElement('div');
    host.id = 'host';
    const topBar = document.createElement('div');
    topBar.id = 'top-bar';
    host.appendChild(topBar);
    document.body.appendChild(host);

    const performPatches = vi.fn();
    const render = vi.fn();
    const createRoot = vi.fn(() => ({ render, unmount: vi.fn() }));

    vi.doMock('../../src/patches', () => ({ performPatches }));
    vi.doMock('react-dom/client', () => ({ createRoot }));
    vi.doMock('../../src/app/App', () => ({
      default: () => <div data-testid="app" />,
    }));
    vi.doMock('../../src/app/Compose', () => ({
      default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    }));
    vi.doMock('../../src/bridges/MessageContextMenu', () => ({
      default: () => <div data-testid="menu" />,
    }));
    vi.doMock(
      '../../src/components/common/ErrorBoundary/ErrorBoundary',
      () => ({
        default: ({ children }: { children: React.ReactNode }) => children,
      }),
    );
    vi.doMock('../../src/providers/backHandlerProvider', () => ({
      default: ({ children }: { children: React.ReactNode }) => children,
    }));
    vi.doMock('../../src/providers/extensionProvider', () => ({
      default: ({ children }: { children: React.ReactNode }) => children,
    }));
    vi.doMock('../../src/providers/popupProvider', () => ({
      default: ({ children }: { children: React.ReactNode }) => children,
    }));
    vi.doMock('../../src/providers/pageProvider', () => ({
      default: ({ children }: { children: React.ReactNode }) => children,
    }));
    vi.doMock('../../src/providers/modalProvider', () => ({
      default: ({ children }: { children: React.ReactNode }) => children,
    }));
    vi.doMock('../../src/providers/contextMenuProvider', () => ({
      default: ({ children }: { children: React.ReactNode }) => children,
    }));

    await import('../../src/index');

    const rootContainer = document.getElementById('discordia-root');
    expect(rootContainer).toBeTruthy();
    expect(topBar.style.display).toBe('none');
    expect(host.firstElementChild?.id).toBe('discordia-root');
    expect(performPatches).toHaveBeenCalledTimes(1);
    expect(createRoot).toHaveBeenCalledWith(rootContainer);
    expect(render).toHaveBeenCalledTimes(1);
  });

  it('does not apply patches again when remounting an existing root', async () => {
    const host = document.createElement('div');
    host.id = 'host';

    const existingRoot = document.createElement('div');
    existingRoot.id = 'discordia-root';
    host.appendChild(existingRoot);

    const topBar = document.createElement('div');
    topBar.id = 'top-bar';
    host.appendChild(topBar);
    document.body.appendChild(host);

    const performPatches = vi.fn();
    const createRoot = vi.fn(() => ({ render: vi.fn(), unmount: vi.fn() }));

    vi.doMock('../../src/patches', () => ({ performPatches }));
    vi.doMock('react-dom/client', () => ({ createRoot }));
    vi.doMock('../../src/app/App', () => ({
      default: () => <div data-testid="app" />,
    }));
    vi.doMock('../../src/app/Compose', () => ({
      default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    }));
    vi.doMock('../../src/bridges/MessageContextMenu', () => ({
      default: () => null,
    }));
    vi.doMock(
      '../../src/components/common/ErrorBoundary/ErrorBoundary',
      () => ({
        default: ({ children }: { children: React.ReactNode }) => children,
      }),
    );
    vi.doMock('../../src/providers/backHandlerProvider', () => ({
      default: ({ children }: { children: React.ReactNode }) => children,
    }));
    vi.doMock('../../src/providers/extensionProvider', () => ({
      default: ({ children }: { children: React.ReactNode }) => children,
    }));
    vi.doMock('../../src/providers/popupProvider', () => ({
      default: ({ children }: { children: React.ReactNode }) => children,
    }));
    vi.doMock('../../src/providers/pageProvider', () => ({
      default: ({ children }: { children: React.ReactNode }) => children,
    }));
    vi.doMock('../../src/providers/modalProvider', () => ({
      default: ({ children }: { children: React.ReactNode }) => children,
    }));
    vi.doMock('../../src/providers/contextMenuProvider', () => ({
      default: ({ children }: { children: React.ReactNode }) => children,
    }));

    await import('../../src/index');

    expect(performPatches).not.toHaveBeenCalled();
    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll('#discordia-root').length).toBe(1);
  });
});
