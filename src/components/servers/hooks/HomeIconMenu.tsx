import { useCallback, useMemo } from 'react';
import { useContextMenu } from '../../../providers/contextMenuProvider';
import type { ContextMenuItem } from '../../common/ContextMenuEntry/ContextMenuEntry';

export const useHomeIconMenu = () => {
  const { showContextMenu } = useContextMenu();

  const menuOptions = useMemo(() => {
    return [
      /*{
        label: 'Change Filter',
      },*/
    ] as ContextMenuItem[];
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      showContextMenu(e, menuOptions);
    },
    [menuOptions, showContextMenu],
  );

  return { handleContextMenu };
};
