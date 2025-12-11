import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuItem {
  label: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: 'default' | 'separator' | 'danger';
  disabled?: boolean;
}

export const ContextMenuContext = createContext<{
  showContextMenu: (e: MouseEvent, items: ContextMenuItem[]) => void;
  closeContextMenu: () => void;
}>({
  showContextMenu: () => {},
  closeContextMenu: () => {},
});

export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [menuItems, setMenuItems] = useState<ContextMenuItem[] | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const closeContextMenu = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleContextMenu = useCallback(
    (e: MouseEvent, items: ContextMenuItem[]) => {
      e.preventDefault();
      e.stopPropagation();
      const clickX = e.clientX;
      const clickY = e.clientY;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const rootW = menuRef.current ? menuRef.current.offsetWidth : 0;
      const rootH = menuRef.current ? menuRef.current.offsetHeight : 0;

      const rightOverflow = clickX + rootW > screenW;
      const bottomOverflow = clickY + rootH > screenH;

      setPosition({
        x: rightOverflow ? clickX - rootW : clickX,
        y: bottomOverflow ? clickY - rootH : clickY,
      });

      setMenuItems(items);
      setIsVisible(true);
    },
    [],
  );

  useEffect(() => {
    const handleClick = () => isVisible && closeContextMenu();
    const handleResize = () => isVisible && closeContextMenu();
    const handleScroll = () => isVisible && closeContextMenu();

    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('contextmenu', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('contextmenu', handleClick);
    };
  }, [isVisible, closeContextMenu]);

  const menuPosition = useMemo(() => {
    if (!isVisible || !position) return null;
    return position;
  }, [isVisible, position]);

  const contextValue = useMemo(
    () => ({
      showContextMenu: handleContextMenu,
      closeContextMenu,
    }),
    [handleContextMenu, closeContextMenu],
  );

  return (
    <ContextMenuContext.Provider value={contextValue}>
      {isVisible &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              top: menuPosition?.y,
              left: menuPosition?.x,
            }}
            className="fixed z-70 min-w-[180px] max-w-[300px] bg-base-discordia border border-darker rounded-lg shadow-lg p-1 animate-in fade-in zoom-in-95 duration-100"
            onContextMenu={(e) => e.preventDefault()}
          >
            {menuItems?.map((item, index) => {
              if (item.variant === 'separator') {
                return (
                  <div key={index} className="border-t border-lighter my-1" />
                );
              }
              return (
                <div
                  key={index}
                  onClick={() => {
                    if (!item.disabled && item.onClick) {
                      item.onClick();
                      closeContextMenu();
                    }
                  }}
                  className={`px-4 py-1.5 rounded-lg  ${
                    item.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-lighter cursor-pointer'
                  } ${
                    item.variant === 'danger' ? 'text-red-500' : 'text-white'
                  } flex items-center space-x-2`}
                >
                  <span>{item.label}</span>
                  {item.icon && <span>{item.icon}</span>}
                </div>
              );
            })}
          </div>,
          document.body,
        )}
      {children}
    </ContextMenuContext.Provider>
  );
}
export default ContextMenuProvider;
