/**
 * Touch long-press → contextmenu synthesizer.
 *
 * Not every touch environment fires `contextmenu` for a long-press (iOS
 * Safari never does; Chrome's devtools touch emulation is unreliable), so
 * every onContextMenu handler in Discordia silently dies there. This watches
 * pointer events document-wide and synthesizes a bubbling `contextmenu` on
 * the pressed element after the hold threshold — unless the browser already
 * fired a native one for this press. The release click after a successful
 * long-press is swallowed so it can't activate the underlying element or
 * instantly close the menu that just opened.
 */

const LONG_PRESS_MS = 550;
const MOVE_SLOP_PX = 10;
const CLICK_SUPPRESS_MS = 700;

let timer: number | null = null;
let startX = 0;
let startY = 0;
let pressTarget: EventTarget | null = null;
let nativeContextMenuAt = 0;
let suppressClicksUntil = 0;

const cancelPress = () => {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
  pressTarget = null;
};

const onPointerDown = (e: PointerEvent) => {
  // Any new press ends the previous press's release-click suppression, so
  // only the long-press's own release can be swallowed — never a real tap.
  suppressClicksUntil = 0;

  if (e.pointerType !== 'touch' || !e.isPrimary) return;

  cancelPress();
  startX = e.clientX;
  startY = e.clientY;
  pressTarget = e.target;

  timer = window.setTimeout(() => {
    timer = null;
    const target = pressTarget;
    pressTarget = null;
    if (!target) return;

    // The browser handled it natively during this press — don't double-fire
    if (Date.now() - nativeContextMenuAt < LONG_PRESS_MS + 200) return;

    suppressClicksUntil = Date.now() + CLICK_SUPPRESS_MS;
    target.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: startX,
        clientY: startY,
      }),
    );
  }, LONG_PRESS_MS);
};

const onPointerMove = (e: PointerEvent) => {
  if (timer === null || e.pointerType !== 'touch') return;
  if (
    Math.abs(e.clientX - startX) > MOVE_SLOP_PX ||
    Math.abs(e.clientY - startY) > MOVE_SLOP_PX
  ) {
    cancelPress();
  }
};

const onPointerEnd = (e: PointerEvent) => {
  if (e.pointerType !== 'touch') return;
  cancelPress();
};

const onNativeContextMenu = (e: MouseEvent) => {
  if (e.isTrusted) nativeContextMenuAt = Date.now();
};

// Capture-phase: swallow the release click that follows a synthesized
// long-press before any UI handler (chat entry, close-listener) sees it.
const onCaptureClick = (e: MouseEvent) => {
  if (Date.now() < suppressClicksUntil) {
    suppressClicksUntil = 0;
    e.preventDefault();
    e.stopPropagation();
  }
};

export const applyTouchContextMenu = () => {
  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerup', onPointerEnd, { passive: true });
  document.addEventListener('pointercancel', onPointerEnd, { passive: true });
  document.addEventListener('contextmenu', onNativeContextMenu, true);
  document.addEventListener('click', onCaptureClick, true);
};

export const removeTouchContextMenu = () => {
  cancelPress();
  document.removeEventListener('pointerdown', onPointerDown);
  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('pointerup', onPointerEnd);
  document.removeEventListener('pointercancel', onPointerEnd);
  document.removeEventListener('contextmenu', onNativeContextMenu, true);
  document.removeEventListener('click', onCaptureClick, true);
};
