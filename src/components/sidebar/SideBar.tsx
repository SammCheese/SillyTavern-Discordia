import { lazy, memo, useCallback, useEffect, useRef } from 'react';
import { useBackHandler } from '../../hooks/useBackHandler';
import { useSidebar } from '../../providers/contentProviders/sidebarStateProvider';

const ProfileMount = lazy(() => import('../ProfileMount/ProfileMount'));
const ChannelBar = lazy(() => import('../channels/ChannelBar'));
const ServerBar = lazy(() => import('../servers/ServerBar'));

const SideBar = () => {
  const state = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  const handleBack = useCallback(() => {
    state.setOpen(false);
  }, [state]);

  useBackHandler(state.open, handleBack, 200);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      isDraggingRef.current = true;
      startXRef.current = e.clientX;

      sidebar.classList.remove(
        'transition-transform',
        'duration-150',
        'ease-in-out',
      );
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - startXRef.current;

      const basePercent = state.open ? '0%' : '-100%';

      sidebar.style.transform = `translate3d(clamp(-100%, calc(${basePercent} + ${deltaX}px), 0%), 0, 0)`;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      const deltaX = e.clientX - startXRef.current;
      const TOGGLE_THRESHOLD = (sidebar.offsetWidth || 250) / 3;

      sidebar.style.transform = '';
      sidebar.classList.add(
        'transition-transform',
        'duration-150',
        'ease-in-out',
      );

      if (state.open && deltaX < -TOGGLE_THRESHOLD) {
        state.setOpen(false);
      } else if (!state.open && deltaX > TOGGLE_THRESHOLD) {
        state.setOpen(true);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
    };
  }, [state, state.open]);

  return (
    <div
      ref={sidebarRef}
      id="sidebar-container"
      className={`fixed top-0 left-0 h-full z-50 touch-none transition-transform duration-150 ease-in-out ${
        state.open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div id="server-container">
        <ServerBar />
        <ChannelBar />
      </div>
      <div id="user-container">
        <ProfileMount icons={state.icons} />
      </div>
    </div>
  );
};

export default memo(SideBar);
