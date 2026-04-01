import {
  memo,
  useState,
  useRef,
  type ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
  children: ReactNode;
  direction?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

const Tooltip = ({
  text,
  children,
  direction = 'top',
  delay = 100,
}: TooltipProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // eslint-disable-next-line no-useless-assignment
    let top = 0;
    // eslint-disable-next-line no-useless-assignment
    let left = 0;

    switch (direction) {
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + 8;
        break;
      case 'top':
      default:
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
    }

    if (left < 8) {
      left = 8;
    } else if (left + tooltipRect.width > window.innerWidth - 8) {
      left = window.innerWidth - tooltipRect.width - 8;
    }

    if (top < 8) {
      top = 8;
    } else if (top + tooltipRect.height > window.innerHeight - 8) {
      top = window.innerHeight - tooltipRect.height - 8;
    }

    setCoords({ top, left });
  }, [direction]);

  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, delay);
  }, [delay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(false);
    setCoords({ top: 0, left: 0 });
  }, []);

  useEffect(() => {
    let raf1: number;

    if (isHovered) {
      raf1 = requestAnimationFrame(updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isHovered, updatePosition]);

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex items-center justify-center cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseEnter}
        onTouchEnd={handleMouseLeave}
        onTouchCancel={handleMouseLeave}
      >
        {children}
      </div>
      {isHovered &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-9999 max-w-[90vw] whitespace-pre-wrap text-center bg-[#111214] text-gray-200 text-sm font-semibold px-3 py-1.5 rounded-md shadow-lg pointer-events-none zoom-in-95 transition-opacity duration-200"
            style={{
              top: coords.top,
              left: coords.left,
              visibility:
                coords.top === 0 && coords.left === 0 ? 'hidden' : 'visible',
            }}
          >
            {text}
            <div
              className={`absolute w-0 h-0 pointer-events-none border-[5px] border-transparent ${
                direction === 'bottom'
                  ? 'bottom-full left-1/2 -translate-x-1/2 border-b-[#111214]'
                  : direction === 'left'
                    ? 'left-full top-1/2 -translate-y-1/2 border-l-[#111214]'
                    : direction === 'right'
                      ? 'right-full top-1/2 -translate-y-1/2 border-r-[#111214]'
                      : 'top-full left-1/2 -translate-x-1/2 border-t-[#111214]'
              }`}
            />
          </div>,
          document.body,
        )}
    </>
  );
};

export default memo(Tooltip);
