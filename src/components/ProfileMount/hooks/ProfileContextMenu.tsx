import { useCallback, useEffect, useMemo, useState } from 'react';
import { useContextMenu } from '../../../providers/contextMenuProvider';
import { logout } from '../../../utils/userUtils';
import type { ContextMenuItem } from '../../common/ContextMenuEntry/ContextMenuEntry';

export const useProfileContextMenu = () => {
  const { showContextMenu } = useContextMenu();

  const [isFullscreen, setIsFullscreen] = useState(
    !!document.fullscreenElement,
  );

  const handleLogout = useCallback(() => {
    logout().catch((error) => {
      dislog.error('Error during logout:', error);
    });
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        dislog.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
        );
      });
    } else {
      document.exitFullscreen().catch((err) => {
        dislog.error(
          `Error attempting to exit full-screen mode: ${err.message} (${err.name})`,
        );
      });
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const fullScreenLabel = useMemo(
    () => (isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'),
    [isFullscreen],
  );

  const menuOptions = useMemo(() => {
    return [
      {
        label: fullScreenLabel,
        onClick: handleFullscreen,
      },
      {
        label: 'Log Out',
        variant: 'danger',
        onClick: handleLogout,
      },
    ] as ContextMenuItem[];
  }, [handleFullscreen, handleLogout, fullScreenLabel]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      showContextMenu(e, menuOptions);
    },
    [menuOptions, showContextMenu],
  );

  return {
    handleContextMenu,
  };
};
