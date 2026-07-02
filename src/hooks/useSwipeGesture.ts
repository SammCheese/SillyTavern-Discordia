import { useEffect } from 'react';

interface SwipeGestureOptions {
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  threshold?: number;
}

/**
 * Horizontal swipe detection on `document.body`.
 *
 * Listeners are native and passive so the browser never blocks scrolling on
 * them; move tracking is only attached while a gesture is in progress. A
 * pointercancel/touchcancel (browser claiming the gesture for scrolling) only
 * detaches its own event family — touch events keep flowing after a
 * pointercancel, and dropping them would lose the swipe.
 */
export const useSwipeGesture = ({
  onSwipeRight,
  onSwipeLeft,
  threshold = 100,
}: SwipeGestureOptions) => {
  useEffect(() => {
    const body = document.body;
    let touchStartX = 0;
    let touchEndX = 0;
    let lastMove = 0;

    const trackMove = (clientX: number) => {
      const now = performance.now();
      if (now - lastMove < 16) return;
      lastMove = now;
      touchEndX = clientX;
    };

    const onPointerMove = (e: PointerEvent) => trackMove(e.clientX ?? 0);
    const onTouchMove = (e: TouchEvent) =>
      trackMove(e.touches[0]?.clientX ?? 0);

    const detachMoveListeners = () => {
      body.removeEventListener('pointermove', onPointerMove);
      body.removeEventListener('touchmove', onTouchMove);
    };

    const onPointerDown = (e: PointerEvent) => {
      touchStartX = e.clientX ?? 0;
      touchEndX = 0;
      body.addEventListener('pointermove', onPointerMove, { passive: true });
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0]?.clientX ?? 0;
      touchEndX = 0;
      body.addEventListener('touchmove', onTouchMove, { passive: true });
    };

    const onGestureEnd = () => {
      detachMoveListeners();
      if (touchStartX === 0 || touchEndX === 0) return;

      if (touchEndX > touchStartX + threshold) onSwipeRight();
      else if (touchEndX < touchStartX - threshold) onSwipeLeft();

      touchStartX = 0;
      touchEndX = 0;
    };

    const onPointerCancel = () => {
      body.removeEventListener('pointermove', onPointerMove);
    };
    const onTouchCancel = () => {
      body.removeEventListener('touchmove', onTouchMove);
    };

    body.addEventListener('pointerdown', onPointerDown, { passive: true });
    body.addEventListener('touchstart', onTouchStart, { passive: true });
    body.addEventListener('pointerup', onGestureEnd, { passive: true });
    body.addEventListener('touchend', onGestureEnd, { passive: true });
    body.addEventListener('pointercancel', onPointerCancel, { passive: true });
    body.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      detachMoveListeners();
      body.removeEventListener('pointerdown', onPointerDown);
      body.removeEventListener('touchstart', onTouchStart);
      body.removeEventListener('pointerup', onGestureEnd);
      body.removeEventListener('touchend', onGestureEnd);
      body.removeEventListener('pointercancel', onPointerCancel);
      body.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [onSwipeRight, onSwipeLeft, threshold]);
};

export default useSwipeGesture;
