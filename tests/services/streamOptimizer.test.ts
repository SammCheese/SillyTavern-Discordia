import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the ST adapter boundary. morphdom is recorded (and applied
// non-recursively) so we can assert the interceptor routes writes through it.
const { morphdom, morphCalls, eventSource, event_types, state } = vi.hoisted(
  () => {
    const morphCalls: string[] = [];
    return {
      morphCalls,
      state: { fadeIn: false },
      morphdom: vi.fn((from: Element, to: Element) => {
        morphCalls.push(to.innerHTML);
        while (from.firstChild) from.removeChild(from.firstChild);
        while (to.firstChild) from.appendChild(to.firstChild);
        return from;
      }),
      eventSource: { on: vi.fn(), removeListener: vi.fn() },
      event_types: {
        STREAM_TOKEN_RECEIVED: 'stream_token_received',
        GENERATION_ENDED: 'generation_ended',
        GENERATION_STOPPED: 'generation_stopped',
      },
    };
  },
);

vi.mock('../../src/st/lib', () => ({ morphdom }));
vi.mock('../../src/st/script', () => ({ eventSource, event_types }));
vi.mock('../../src/st/powerUser', () => ({
  get power_user() {
    return { stream_fade_in: state.fadeIn };
  },
}));

(globalThis as { dislog?: unknown }).dislog = {
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};

import { __test } from '../../src/services/streamOptimizer';

const buildChat = () => {
  document.body.innerHTML = `
    <div id="chat">
      <div class="mes"><div class="mes_text">old</div></div>
      <div class="mes last_mes"><div class="mes_text">start</div></div>
    </div>`;
  return document.querySelector(
    '#chat .mes.last_mes .mes_text',
  ) as HTMLElement;
};

describe('streamOptimizer', () => {
  beforeEach(() => {
    morphCalls.length = 0;
    morphdom.mockClear();
    state.fadeIn = false;
    __test.onGenerationDone();
  });

  it('routes innerHTML writes on the streaming message through morphdom', () => {
    const el = buildChat();
    __test.onStreamToken();

    el.innerHTML = '<p>Hello</p>';
    el.innerHTML = '<p>Hello world</p>';

    expect(morphCalls).toEqual(['<p>Hello</p>', '<p>Hello world</p>']);
    expect(el.innerHTML).toBe('<p>Hello world</p>');
    // Same live element is reused, never replaced.
    expect(document.querySelector('#chat .mes.last_mes .mes_text')).toBe(el);
  });

  it('does not touch other messages', () => {
    buildChat();
    __test.onStreamToken();

    const other = document.querySelector(
      '#chat .mes:not(.last_mes) .mes_text',
    ) as HTMLElement;
    other.innerHTML = '<span>native</span>';

    expect(morphCalls).toHaveLength(0);
    expect(other.innerHTML).toBe('<span>native</span>');
  });

  it('restores native innerHTML when generation ends', () => {
    const el = buildChat();
    __test.onStreamToken();
    el.innerHTML = '<p>streaming</p>';
    expect(morphCalls).toHaveLength(1);

    __test.onGenerationDone();
    el.innerHTML = '<p>after</p>';

    expect(morphCalls).toHaveLength(1); // no further morph calls
    expect(el.innerHTML).toBe('<p>after</p>');
  });

  it('leaves the fade-in path alone', () => {
    state.fadeIn = true;
    const el = buildChat();
    __test.onStreamToken();

    el.innerHTML = '<p>fade</p>';

    expect(morphCalls).toHaveLength(0);
    expect(el.innerHTML).toBe('<p>fade</p>');
  });

  it('re-targets when the streaming element is replaced mid-stream', () => {
    const first = buildChat();
    __test.onStreamToken();
    expect(__test.getCurrentTarget()).toBe(first);

    // ST rebuilds the message DOM; a fresh .mes_text appears.
    const lastMes = document.querySelector('#chat .mes.last_mes') as HTMLElement;
    lastMes.innerHTML = '<div class="mes_text">reset</div>';
    const second = lastMes.querySelector('.mes_text') as HTMLElement;

    __test.onStreamToken();
    expect(__test.getCurrentTarget()).toBe(second);

    second.innerHTML = '<p>new</p>';
    expect(el2Morphed()).toBe('<p>new</p>');

    function el2Morphed() {
      return second.innerHTML;
    }
  });
});
