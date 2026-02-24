import { useCallback, useMemo } from 'react';
import { useContextMenu } from '../../../providers/contextMenuProvider';
import { useModal } from '../../../providers/modalProvider';
import CharacterModal from '../../../modals/Character/CharacterModal';
import type { ContextMenuItem } from '../../common/ContextMenuEntry/ContextMenuEntry';

export const useHomeIconMenu = () => {
  const { showContextMenu } = useContextMenu();
  const { openModal } = useModal();

  const menuOptions = useMemo(() => {
    return [
      {
        label: 'New Character',
        onClick: () => {
          openModal(<CharacterModal type="create" />);
        },
      },
    ] as ContextMenuItem[];
  }, [openModal]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      showContextMenu(e, menuOptions);
    },
    [menuOptions, showContextMenu],
  );

  return { handleContextMenu };
};
