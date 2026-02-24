/* eslint-disable @eslint-react/no-unnecessary-use-prefix */
import { Suspense } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

describe('App', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders sidebar through portal into root container', async () => {
    const rootContainer = document.createElement('div');
    rootContainer.id = 'discordia-root';
    document.body.appendChild(rootContainer);

    const sidebarState = {
      open: true,
      setOpen: vi.fn(),
      entities: [],
      chats: [],
      recentChats: [],
      icons: [],
      isLoadingChats: false,
      isInitialLoad: false,
      context: 'recent' as const,
    };

    vi.doMock('../../src/index', () => ({
      rootContainer,
      default: vi.fn(),
    }));

    vi.doMock('../../src/hooks/useSidebarState', () => ({
      useSidebarState: () => sidebarState,
    }));

    vi.doMock('../../src/providers/searchProvider', () => ({
      SearchProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="search-provider">{children}</div>
      ),
    }));

    vi.doMock('../../src/components/sidebar/SideBar', () => ({
      default: ({ open }: { open: boolean }) => (
        <div data-testid="sidebar">open:{String(open)}</div>
      ),
    }));

    const { default: App } = await import('../../src/app/App');

    render(
      <Suspense fallback={<div data-testid="loading">loading</div>}>
        <App />
      </Suspense>,
    );

    const sidebar = await screen.findByTestId('sidebar');
    expect(sidebar.textContent).toContain('open:true');
    expect(
      rootContainer.querySelector('[data-testid="search-provider"]'),
    ).toBeTruthy();
  });

  it('passes setOpen callback from sidebar state', async () => {
    const rootContainer = document.createElement('div');
    rootContainer.id = 'discordia-root';
    document.body.appendChild(rootContainer);

    const setOpen = vi.fn();

    vi.doMock('../../src/index', () => ({
      rootContainer,
      default: vi.fn(),
    }));

    vi.doMock('../../src/hooks/useSidebarState', () => ({
      useSidebarState: () => ({
        open: false,
        setOpen,
        entities: [],
        chats: [],
        recentChats: [],
        icons: [],
        isLoadingChats: false,
        isInitialLoad: true,
        context: 'chat' as const,
      }),
    }));

    vi.doMock('../../src/providers/searchProvider', () => ({
      SearchProvider: ({ children }: { children: React.ReactNode }) => children,
    }));

    vi.doMock('../../src/components/sidebar/SideBar', () => ({
      default: ({ setOpen: setter }: { setOpen: (open: boolean) => void }) => {
        setter(true);
        return <div data-testid="sidebar-callback" />;
      },
    }));

    const { default: App } = await import('../../src/app/App');

    render(
      <Suspense fallback={<div data-testid="loading">loading</div>}>
        <App />
      </Suspense>,
    );

    await screen.findByTestId('sidebar-callback');
    expect(setOpen).toHaveBeenCalledWith(true);
  });
});
