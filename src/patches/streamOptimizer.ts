import { morphdom } from '../st/lib';
import { eventSource, event_types } from '../st/script';
import { power_user } from '../st/powerUser';

/**
 * Streaming render cost reducer.
 *
 * By default (fade-in off) ST rebuilds a streamed message's whole subtree
 * every throttle tick via `messageTextDom.innerHTML = formattedText`. That
 * teardown+rebuild re-lays-out and repaints the entire message each tick
 * (cost grows with message length) and reloads any inline images.
 *
 * ST already bundles morphdom and uses it for the fade-in path
 * (scripts/util/stream-fadein.js). This routes the default path through the
 * same morphdom: the live `.mes_text` is kept and only the changed tail
 * nodes are patched, so layout/paint is confined to what actually changed
 * and stable nodes (images, code blocks) are preserved across ticks.
 *
 * Implementation: a per-element `innerHTML` setter override installed on the
 * streaming message's `.mes_text` for the duration of a generation, removed
 * when it ends. Fade-in mode is left alone (ST already morphs there). Any
 * morph error falls back to the native innerHTML assignment, so the worst
 * case is current behavior.
 */

const NATIVE_INNER_HTML = Object.getOwnPropertyDescriptor(
  Element.prototype,
  'innerHTML',
);

const patchedElements = new WeakSet<Element>();
let currentTarget: HTMLElement | null = null;

const morphInnerHtml = (el: HTMLElement, html: string) => {
  // Build the desired tree on a detached shallow clone (same tag+attrs,
  // native innerHTML, no layout), then reconcile the live element in place.
  // Mirrors ST's own fade-in usage of morphdom.
  const clone = el.cloneNode(false) as HTMLElement;
  NATIVE_INNER_HTML?.set?.call(clone, html);
  morphdom(el, clone);
};

const installInterceptor = (el: HTMLElement) => {
  if (!NATIVE_INNER_HTML?.set || patchedElements.has(el)) return;
  patchedElements.add(el);

  Object.defineProperty(el, 'innerHTML', {
    configurable: true,
    get(this: HTMLElement) {
      return NATIVE_INNER_HTML.get?.call(this);
    },
    set(this: HTMLElement, html: string) {
      try {
        morphInnerHtml(this, String(html));
      } catch (error) {
        dislog.error('Stream morph failed; using innerHTML:', error);
        NATIVE_INNER_HTML.set?.call(this, html);
      }
    },
  });
};

const restoreInterceptor = (el: HTMLElement | null) => {
  if (!el || !patchedElements.has(el)) return;
  // Deleting the own accessor restores the Element.prototype behaviour.
  delete (el as unknown as { innerHTML?: unknown }).innerHTML;
  patchedElements.delete(el);
};

const onStreamToken = () => {
  // Fade-in already morphs via applyStreamFadeIn — don't double-handle it.
  if (power_user?.stream_fade_in) return;

  const el = document.querySelector<HTMLElement>(
    '#chat .mes.last_mes .mes_text',
  );
  if (!el) return;

  // ST may re-query messageTextDom mid-stream; re-target if it changed.
  if (el !== currentTarget) {
    restoreInterceptor(currentTarget);
    currentTarget = el;
  }
  installInterceptor(el);
};

const onGenerationDone = () => {
  restoreInterceptor(currentTarget);
  currentTarget = null;
};

export const applyStreamOptimizer = () => {
  if (typeof morphdom !== 'function') {
    dislog.warn('morphdom unavailable; stream optimizer disabled.');
    return;
  }
  eventSource.on(event_types.STREAM_TOKEN_RECEIVED, onStreamToken);
  eventSource.on(event_types.GENERATION_ENDED, onGenerationDone);
  eventSource.on(event_types.GENERATION_STOPPED, onGenerationDone);
};

export const removeStreamOptimizer = () => {
  eventSource.removeListener(event_types.STREAM_TOKEN_RECEIVED, onStreamToken);
  eventSource.removeListener(event_types.GENERATION_ENDED, onGenerationDone);
  eventSource.removeListener(event_types.GENERATION_STOPPED, onGenerationDone);
  onGenerationDone();
};

// Exposed for tests.
export const __test = {
  onStreamToken,
  onGenerationDone,
  morphInnerHtml,
  getCurrentTarget: () => currentTarget,
};
