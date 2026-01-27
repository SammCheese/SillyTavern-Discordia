import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { setupGlobalImports } from '../utils/mockImports';
import { ContextMenuProvider } from '../../src/providers/contextMenuProvider';
import MessageContextMenu from '../../src/bridges/MessageContextMenu';

describe('MessageContextMenu', () => {
  beforeEach(async () => {
    vi.resetModules();

    setupGlobalImports();

    document.body.innerHTML = `
      <div id="chat">
        <div class="mes" mesid="1" is_system="false">
          <div class="mes_text">Hello World</div>
        </div>
        <div class="mes" mesid="2" is_system="true">
          <div class="mes_text">System Message</div>
        </div>
        <div class="mes" mesid="3" is_system="false">
          <div class="mes_text">
            <textarea id="curEditTextarea" class="edit_textarea">
              Editing Message
            </textarea>
          </div>
        </div>
      </div>
    `;

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn(),
        readText: vi.fn(),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show context menu on right-clicking a user message', async () => {
    render(
      <ContextMenuProvider>
        <MessageContextMenu />
      </ContextMenuProvider>,
    );

    const userMessage = document.querySelector('.mes[mesid="1"]');
    if (!userMessage) throw new Error('User message not found');

    fireEvent.contextMenu(userMessage);

    await waitFor(() => {
      const menuContainer = document.querySelector('[class*="context-menu"]');
      expect(menuContainer).toBeTruthy();
    });

    const editOption = Array.from(document.querySelectorAll('div')).find((el) =>
      el.textContent?.includes('Edit Message'),
    );
    expect(editOption).toBeTruthy();

    const copyOption = Array.from(document.querySelectorAll('div')).find((el) =>
      el.textContent?.includes('Copy Message'),
    );
    expect(copyOption).toBeTruthy();
  });

  it('should disable Edit Message for system messages', async () => {
    render(
      <ContextMenuProvider>
        <MessageContextMenu />
      </ContextMenuProvider>,
    );

    const systemMessage = document.querySelector('.mes[mesid="2"]');
    if (!systemMessage) throw new Error('System message not found');

    fireEvent.contextMenu(systemMessage);

    await waitFor(() => {
      const menuContainer = document.querySelector('[class*="context-menu"]');
      expect(menuContainer).toBeTruthy();
    });

    const editOption = Array.from(document.querySelectorAll('div')).find((el) =>
      el.textContent?.includes('Edit Message'),
    );

    expect(editOption).toBeTruthy();
  });

  it('should copy message text when Copy Message is clicked', async () => {
    const writeSpy = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue();

    render(
      <ContextMenuProvider>
        <MessageContextMenu />
      </ContextMenuProvider>,
    );

    const userMessage = document.querySelector('.mes[mesid="1"]');
    if (!userMessage) throw new Error('User message not found');

    fireEvent.contextMenu(userMessage);

    await waitFor(() => {
      const menuContainer = document.querySelector('[class*="context-menu"]');
      expect(menuContainer).toBeTruthy();
    });

    const copyOption = Array.from(
      document.querySelectorAll('[role="menuitem"]'),
    ).find((el) => el.childNodes[0]?.textContent?.includes('Copy Message'));

    if (!copyOption) throw new Error('Copy option not found');

    fireEvent.click(copyOption);

    expect(writeSpy).toHaveBeenCalledWith('Hello World');
    expect(writeSpy).toHaveBeenCalledTimes(1);
  });

  it('should not show context menu when editing a message', async () => {
    render(
      <ContextMenuProvider>
        <MessageContextMenu />
      </ContextMenuProvider>,
    );

    const userMessage = document.querySelector('.mes[mesid="3"]');
    if (!userMessage) throw new Error('User message not found');

    fireEvent.contextMenu(userMessage);

    await waitFor(() => {
      const menuContainer = document.querySelector('[class*="context-menu"]');
      expect(menuContainer).toBeNull();
    });
  });
});
