import { useCallback, useMemo, useRef } from 'react';
import { useSTEvents } from '../../../hooks/useSTEvents';
import { useStore } from '../../../utils/store';
import { event_types, isGenerating } from '../../../st/script';
import {
  entityKey,
  getActiveEntityKey,
  openEntity,
  selectedEntityKeyStore,
} from '../services/entitySelection';

export const useEntitySelection = () => {
  const selectedKey = useStore(selectedEntityKeyStore);
  const latestRequestRef = useRef(0);

  const syncFromContext = useCallback(() => {
    selectedEntityKeyStore.set(getActiveEntityKey());
  }, []);

  useSTEvents(
    useMemo(
      () => ({
        [event_types.CHAT_CHANGED]: syncFromContext,
        [event_types.CHAT_DELETED]: syncFromContext,
      }),
      [syncFromContext],
    ),
  );

  const selectEntity = useCallback((entity: Entity) => {
    if (isGenerating()) {
      toastr.warning(
        'Please wait or abort the current generation before switching chats.',
      );
      return;
    }

    const requestId = ++latestRequestRef.current;
    selectedEntityKeyStore.set(entityKey(entity));

    void openEntity(entity).catch((error) => {
      dislog.error('Error selecting entity:', error);

      if (latestRequestRef.current === requestId) {
        selectedEntityKeyStore.set(getActiveEntityKey());
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    selectedEntityKeyStore.set(null);
  }, []);

  return { selectedKey, selectEntity, clearSelection } as const;
};
