import { useCallback, useContext, useMemo } from 'react';
import { ContextMenuContext } from '../../../providers/contextMenuProvider';
//import { ModalContext } from '../../../providers/modalProvider';
import type { ContextMenuItem } from '../../common/ContextMenuEntry/ContextMenuEntry';

export const useHomeIconMenu = () => {
  const { showContextMenu } = useContext(ContextMenuContext);
  //const { openModal } = useContext(ModalContext);

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
