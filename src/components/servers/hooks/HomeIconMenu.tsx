import { useCallback, useMemo } from 'react';
import { useContextMenu } from '../../../providers/contextMenuProvider';
import { useModal } from '../../../providers/modalProvider';
import CharacterModal from '../../../modals/Character/CharacterModal';
import type { ContextMenuItem } from '../../common/ContextMenuEntry/ContextMenuEntry';
import { DISCORDIA_EVENTS } from '../../../events/eventTypes';
import {
  getDiscordiaSettings,
  updateDiscordiaSettings,
} from '../../../services/extensionSettingService';

import { eventSource } from '../../../st/script';
export const useHomeIconMenu = () => {
  const { showContextMenu } = useContextMenu();
  const { openModal } = useModal();

  const unhideAllCharacters = useCallback(() => {
    const hiddenCharacters = getDiscordiaSettings().hiddenCharacters;
    if (hiddenCharacters.length === 0) return;

    updateDiscordiaSettings({ hiddenCharacters: [] });

    eventSource.emit(DISCORDIA_EVENTS.ENTITY_CHANGED);
  }, []);

  const menuOptions = useMemo(() => {
    return [
      {
        label: 'New Character',
        onClick: () => {
          openModal(<CharacterModal type="create" />);
        },
      },
      {
        label: 'Unhide Characters',
        onClick: unhideAllCharacters,
      },
    ] as ContextMenuItem[];
  }, [openModal, unhideAllCharacters]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      showContextMenu(e, menuOptions);
    },
    [menuOptions, showContextMenu],
  );

  return { handleContextMenu };
};
