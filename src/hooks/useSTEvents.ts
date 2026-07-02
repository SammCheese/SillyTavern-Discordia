import { useEffect } from 'react';
import { eventSource } from '../st/script';

// Contravariant-friendly: accepts any function; the hook never invokes
// handlers itself, it only registers them with eventSource.
type STEventHandler = (...args: never[]) => void;

/**
 * Subscribes to SillyTavern events for the lifetime of the component.
 *
 * Memoize the map (`useMemo`) — a new object identity re-subscribes every
 * listener on each render.
 */
export const useSTEvents = (eventMap: Record<string, STEventHandler>): void => {
  useEffect(() => {
    for (const [event, handler] of Object.entries(eventMap)) {
      eventSource.on(event, handler);
    }

    return () => {
      for (const [event, handler] of Object.entries(eventMap)) {
        eventSource.removeListener(event, handler);
      }
    };
  }, [eventMap]);
};

export default useSTEvents;
