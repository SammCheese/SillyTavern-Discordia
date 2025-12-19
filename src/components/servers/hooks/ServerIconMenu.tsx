import { lazy, useCallback, useContext, useMemo } from 'react';
import { ContextMenuContext } from '../../../providers/contextMenuProvider';
import { ModalContext } from '../../../providers/modalProvider';
import type { ContextMenuItem } from '../../common/ContextMenuEntry/ContextMenuEntry';
import { DISCORDIA_EVENTS } from '../../../events/eventTypes';

const CharacterModal = lazy(
  () => import('../../../modals/Character/CharacterModal'),
);
const GroupEditModal = lazy(
  () => import('../../../modals/GroupEdit/GroupModal'),
);

const { deleteCharacter, eventSource, closeCurrentChat } =
  await imports('@script');
const { deleteGroup } = await imports('@scripts/groupChats');

export const useServerIconMenu = (entity: Entity) => {
  const { showContextMenu } = useContext(ContextMenuContext);
  const { openModal } = useContext(ModalContext);

  const handleDelete = useCallback(async () => {
    try {
      if (entity.type === 'character') {
        if (!entity.item?.avatar) return;

        const { characterId, characters } = SillyTavern.getContext();
        const avatarUrl = entity.item.avatar.toString();
        const character = characters.find(
          (c) => c.avatar?.toString() === avatarUrl,
        );
        const isCurrentCharacter =
          characterId !== null &&
          characterId !== undefined &&
          character &&
          characters[characterId] === character;

        if (isCurrentCharacter) {
          await closeCurrentChat();
        }

        await deleteCharacter(avatarUrl, {
          deleteChats: true,
        });
      } else if (entity.type === 'group') {
        if (!entity?.id) return;
        await deleteGroup(entity.id.toString());
      }

      eventSource.emit(DISCORDIA_EVENTS.ENTITIES_LENGTH_CHANGED);
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  }, [entity]);

  const handleEdit = useCallback(() => {
    if (entity.type === 'character') {
      openModal(
        <CharacterModal avatarName={entity.item?.avatar.toString() || ''} />,
      );
    } else if (entity.type === 'group') {
      openModal(<GroupEditModal entity={entity} />);
    }
  }, [entity, openModal]);

  const menuOptions = useMemo(() => {
    return [
      {
        label: entity.item?.name || 'Character',
        disabled: true,
      },
      { label: '---', variant: 'separator' },
      {
        label: 'Edit',
        onClick: handleEdit,
      },
      {
        label: '---',
        variant: 'separator',
      },
      {
        label: 'Delete',
        variant: 'danger',
        onClick: handleDelete,
      },
    ] as ContextMenuItem[];
  }, [entity.item?.name, handleEdit, handleDelete]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      showContextMenu(e, menuOptions);
    },
    [menuOptions, showContextMenu],
  );

  return { handleContextMenu };
};
