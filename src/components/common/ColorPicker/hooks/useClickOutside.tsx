import { useEffect } from 'react';

const useClickOutside = (
  ref,
  handler: (event: MouseEvent | TouchEvent) => void,
) => {
  useEffect(() => {
    let startedInside = false;
    let startedWhenMounted = false;

    const listener = (event) => {
      if (startedInside || !startedWhenMounted) return;
      if (!ref.current || ref.current.contains(event.target)) return;

      handler(event);
    };

    const validateEventStart = (event) => {
      startedWhenMounted = ref.current;
      startedInside = ref.current && ref.current.contains(event.target);
    };

    document.addEventListener('mousedown', validateEventStart, {
      capture: true,
    });
    document.addEventListener('touchstart', validateEventStart, {
      capture: true,
    });
    document.addEventListener('click', listener, { capture: true });

    return () => {
      document.removeEventListener('mousedown', validateEventStart, {
        capture: true,
      });
      document.removeEventListener('touchstart', validateEventStart, {
        capture: true,
      });
      document.removeEventListener('click', listener, { capture: true });
    };
  }, [ref, handler]);
};

export default useClickOutside;
