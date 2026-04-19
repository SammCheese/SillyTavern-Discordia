import { createContext, use } from 'react';
import { useSidebarState } from '../../hooks/useSidebarState';

const SidebarContext = createContext<ReturnType<typeof useSidebarState> | null>(
  null,
);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const sidebarState = useSidebarState();

  return <SidebarContext value={sidebarState}>{children}</SidebarContext>;
};

export const useSidebar = () => {
  const context = use(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
