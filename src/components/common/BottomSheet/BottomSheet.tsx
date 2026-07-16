import { memo, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxRatio?: number;
  showHandle?: boolean;
}

const CLOSE_DISTANCE_PX = 120;
const CLOSE_VELOCITY = 0.5;

const BottomSheet = ({
  open,
  onClose,
  children,
  maxRatio = 0.9,
  showHandle = true,
}: BottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    startY: 0,
    startH: 0,
    initialH: 0,
    translate: 0,
    lastY: 0,
    lastT: 0,
    velocity: 0,
  });

  useEffect(() => {
    const sheet = sheetRef.current;
    if (sheet) {
      sheet.style.transform = '';
      sheet.style.transition = '';
    }
    if (open) dragRef.current.initialH = 0;
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const onPointerDown = (e: React.PointerEvent) => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const d = dragRef.current;
    const height = sheet.getBoundingClientRect().height;
    d.active = true;
    d.startY = e.clientY;
    d.startH = height;
    if (!d.initialH) d.initialH = height;
    d.translate = 0;
    d.lastY = e.clientY;
    d.lastT = performance.now();
    d.velocity = 0;

    sheet.style.transition = 'none';
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    const sheet = sheetRef.current;
    if (!d.active || !sheet) return;

    const now = performance.now();
    const dt = now - d.lastT || 1;
    d.velocity = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastT = now;

    const dy = e.clientY - d.startY;
    const targetH = d.startH - dy;
    const maxH = maxRatio * window.innerHeight;

    if (targetH > d.initialH) {
      sheet.style.height = `${Math.min(targetH, maxH)}px`;
      sheet.style.transform = 'translateY(0)';
      d.translate = 0;
    } else {
      sheet.style.height = `${d.initialH}px`;
      d.translate = d.initialH - targetH;
      sheet.style.transform = `translateY(${d.translate}px)`;
    }
  };

  const endDrag = () => {
    const d = dragRef.current;
    const sheet = sheetRef.current;
    if (!d.active || !sheet) return;
    d.active = false;

    sheet.style.transition = '';

    const shouldClose =
      d.translate > Math.min(CLOSE_DISTANCE_PX, d.initialH * 0.25) ||
      (d.translate > 0 && d.velocity > CLOSE_VELOCITY);

    if (shouldClose) {
      onClose();
      return;
    }

    sheet.style.transform = '';
  };

  const container = document.getElementById('discordia-root') || document.body;

  return createPortal(
    <div
      className={`fixed inset-0 w-dvw h-dvh ${
        open ? 'bg-black/60' : 'bg-transparent pointer-events-none'
      } transition-colors duration-250`}
      // Inline z-index: #discordia-root > * overrides utility classes.
      // Explicit w-dvw/h-dvh: ST puts transform:translateZ(0) on <html>,
      // which reroutes fixed positioning to html's 0-height box — inset-0
      // alone collapses. Every overlay in this codebase sizes explicitly.
      style={{ zIndex: 60 }}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`absolute bottom-0 left-0 w-full flex flex-col rounded-t-xl border-t border-darker shadow-2xl
          transition-transform duration-250 ease-out
          ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{
          maxHeight: `${maxRatio * 100}dvh`,
          backgroundColor: 'var(--SmartThemeBlurTintColor, #2a2a2a)',
        }}
      >
        {showHandle && (
          <div
            className="w-full py-3 shrink-0 cursor-grab touch-none"
            aria-label="Drag to resize, swipe down to close"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div className="w-10 h-1 rounded-full bg-white/30 mx-auto" />
          </div>
        )}
        <div className="overflow-y-auto overscroll-contain grow px-4 pb-6">
          {children}
        </div>
      </div>
    </div>,
    container,
  );
};

export default memo(BottomSheet);
