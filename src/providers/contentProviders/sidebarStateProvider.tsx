import { createContext, use, useMemo } from 'react';
import { useSidebarState } from '../../hooks/useSidebarState';

type SidebarState = ReturnType<typeof useSidebarState>;

type SidebarUiValue = Pick<SidebarState, 'open' | 'setOpen'>;
type SidebarDataValue = Omit<SidebarState, 'open'>;

const SidebarUiContext = createContext<SidebarUiValue | null>(null);
const SidebarDataContext = createContext<SidebarDataValue | null>(null);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    open,
    setOpen,
    refreshContext,
    entities,
    chats,
    recentChats,
    icons,
    isLoadingChats,
    isInitialLoad,
    context,
  } = useSidebarState();

  const uiValue = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  const dataValue = useMemo(
    () => ({
      entities,
      chats,
      recentChats,
      icons,
      isLoadingChats,
      isInitialLoad,
      context,
      setOpen,
      refreshContext,
    }),
    [
      entities,
      chats,
      recentChats,
      icons,
      isLoadingChats,
      isInitialLoad,
      context,
      setOpen,
      refreshContext,
    ],
  );

  return (
    <SidebarUiContext value={uiValue}>
      <SidebarDataContext value={dataValue}>{children}</SidebarDataContext>
    </SidebarUiContext>
  );
};

export const useSidebarUi = () => {
  const context = use(SidebarUiContext);
  if (!context) {
    throw new Error('useSidebarUi must be used within a SidebarProvider');
  }
  return context;
};

export const useSidebarData = () => {
  const context = use(SidebarDataContext);
  if (!context) {
    throw new Error('useSidebarData must be used within a SidebarProvider');
  }
  return context;
};
