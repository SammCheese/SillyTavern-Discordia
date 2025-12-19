import { useState, useCallback, useEffect, useRef } from 'react';
import { getRecentChats } from "../utils/utils";
import { DISCORDIA_EVENTS } from '../events/eventTypes';

const { getGroupPastChats } = await imports('@scripts/groupChats');
const { getEntitiesList, eventSource, event_types, getPastCharacterChats } = await imports('@script');

type ChatViewMode = 'recent' | 'context';

interface SidebarState {
  open: boolean;
  entities: Entity[];
  chats: Chat[];
  icons: Icon[];
  isLoadingChats: boolean;
}

const CHANNEL_MENU_CONFIG = [
  { name: 'Backgrounds', id: '#backgrounds-button' },
  { name: 'Persona Management', id: '#persona-management-button' },
  { name: 'Character Selector', id: '#rightNavHolder' },
  { name: 'Extensions Settings', id: '#extensions-settings-button' },
  { name: 'Advanced Formatting', id: '#advanced-formatting-button' },
  { name: 'World Info', id: '#WI-SP-button' },
];


export const useSidebarState = () => {
  const chatViewModeRef = useRef<ChatViewMode>('recent');
  const inFlightRefresh = useRef<Promise<void> | null>(null);
  const queuedRefresh = useRef(false);
  const queuedForceRecent = useRef(false);

  const [state, setState] = useState<SidebarState>({
    open: false,
    entities: [],
    chats: [],
    icons: [],
    isLoadingChats: true,
  });

  const setOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, open }));
  }, []);


  const refreshChats = useCallback(async (forceRecent = false) => {
    if (inFlightRefresh.current) {
      queuedRefresh.current = true;
      queuedForceRecent.current = queuedForceRecent.current || forceRecent;
      return inFlightRefresh.current;
    }

    setState(prev => prev.isLoadingChats ? prev : { ...prev, isLoadingChats: true });

    const { characterId, groupId } = SillyTavern.getContext();
    const hasGroup = groupId !== null && groupId !== undefined;
    const hasCharacter =
      characterId !== null &&
      characterId !== undefined &&
      Number(characterId) >= 0;
    const entities = getEntitiesList({ doFilter: true, doSort: true });


    const doRefresh = async () => {
      if (hasGroup) {
        const chats = await getGroupPastChats(groupId.toString());
        chatViewModeRef.current = 'context';
        setState(prev => {
          if (prev.chats === chats && prev.entities === entities) {
            return { ...prev, isLoadingChats: false };
          }
          return { ...prev, chats, entities, isLoadingChats: false };
        });
        return;
      }

      if (hasCharacter) {
        const chats = await getPastCharacterChats();
        chatViewModeRef.current = 'context';
        setState(prev => {
          if (prev.chats === chats && prev.entities === entities) {
            return { ...prev, isLoadingChats: false };
          }
          return { ...prev, chats, entities, isLoadingChats: false };
        });
        return;
      }

      const shouldForceRecent = forceRecent || chatViewModeRef.current !== 'context';

      if (shouldForceRecent) {
        const chats = await getRecentChats(entities);
        chatViewModeRef.current = 'recent';
        setState(prev => {
          if (prev.chats === chats && prev.entities === entities && prev.open) {
            return { ...prev, isLoadingChats: false };
          }
          return { ...prev, chats, entities, open: true, isLoadingChats: false };
        });
      } else {
        setState(prev => ({ ...prev, entities, isLoadingChats: false }));
      }
    };

    inFlightRefresh.current = doRefresh()
      .catch(error => {
        console.error('Error updating chat data:', error);
        setState(prev => ({ ...prev, entities, isLoadingChats: false }));
      })
      .finally(async () => {
        inFlightRefresh.current = null;
        if (queuedRefresh.current) {
          const force = queuedForceRecent.current;
          queuedRefresh.current = false;
          queuedForceRecent.current = false;
          await refreshChats(force);
        }
      });

    return inFlightRefresh.current;
  }, []);

  const handleHomeButton = useCallback(() => {
    refreshChats(true);
  }, [refreshChats]);

  const handleEntitiesChanged = useCallback(() => {
    refreshChats(true);
  }, [refreshChats]);

  const handleChatSwitchPending = useCallback(() => {
    chatViewModeRef.current = 'context';
  }, []);

  const processMenuIcons = useCallback(() => {
    const settingsHolder = $('#top-settings-holder');
    if (!settingsHolder.length) return;

    const icons: Icon[] = [];
    settingsHolder.children().each((_, el) => {
      const jEl = $(el);
      const id = `#${jEl.attr('id')}`;
      const infoEl = jEl.find('.drawer-icon');

      icons.push({
        className: infoEl.attr('class') || '',
        title: infoEl.attr('title') || jEl.find('.drawer-toggle').attr('title') || '',
        showInProfile: !CHANNEL_MENU_CONFIG.some((item) => item.id === id),
        id: id,
      });
    });

    settingsHolder.attr('style', 'display: none !important;');
    setState(prev => ({ ...prev, icons }));
  }, []);

  useEffect(() => {
    processMenuIcons();


    const handleSettingsUpdate = () => {
      if (window.innerWidth > 1000 && !state.open) {
        setOpen(true);
      }
    };

    // Event Handling
    eventSource.on(event_types.APP_READY, refreshChats);
    eventSource.on(event_types.CHAT_CHANGED, refreshChats);
    eventSource.on(event_types.CHAT_DELETED, refreshChats);
    eventSource.on(event_types.CHAT_CREATED, refreshChats);
    eventSource.on(event_types.SETTINGS_UPDATED, handleSettingsUpdate);
    eventSource.on(event_types.CHARACTER_EDITED, refreshChats);
    eventSource.on(event_types.CHARACTER_RENAMED, refreshChats);

    // Our own Events
    eventSource.on(DISCORDIA_EVENTS.ENTITIES_LENGTH_CHANGED, handleEntitiesChanged);
    eventSource.on(DISCORDIA_EVENTS.HOME_BUTTON_CLICKED, handleHomeButton);
    eventSource.on(DISCORDIA_EVENTS.CHAT_SWITCH_PENDING, handleChatSwitchPending);

    // Swipe Listeners
    const THRESHOLD = 100;
    const body = $('body');
    let touchStartX = 0;
    let touchEndX = 0;

    const onPointerDown = (e) => { touchStartX = e.clientX ?? 0; };
    const onPointerMove = (e) => { touchEndX = e.clientX ?? 0; };
    const onTouchStart = (e) => { touchStartX = e.originalEvent?.touches[0]?.clientX ?? 0; };
    const onTouchMove = (e) => { touchEndX = e.originalEvent?.touches[0]?.clientX ?? 0; };

    const onPointerUp = () => {
      if (touchStartX === 0 || touchEndX === 0) return;
      if (touchEndX > touchStartX + THRESHOLD) setOpen(true);
      else if (touchEndX < touchStartX - THRESHOLD) {
        if (window.innerWidth <= 1000) setOpen(false);
      }
      touchStartX = 0;
      touchEndX = 0;
    };

    if (body) {
      body.on('pointerdown', onPointerDown);
      body.on('pointermove', onPointerMove);
      body.on('touchstart', onTouchStart);
      body.on('touchmove', onTouchMove);
      body.on('touchend pointerup', onPointerUp);
    }

    return () => {
      eventSource.removeListener(event_types.APP_READY, refreshChats);
      eventSource.removeListener(event_types.CHAT_CHANGED, refreshChats);
      eventSource.removeListener(event_types.CHAT_DELETED, refreshChats);
      eventSource.removeListener(event_types.CHAT_CREATED, refreshChats);
      eventSource.removeListener(event_types.SETTINGS_UPDATED, handleSettingsUpdate);
      eventSource.removeListener(event_types.CHARACTER_EDITED, refreshChats);
      eventSource.removeListener(event_types.CHARACTER_RENAMED, refreshChats);
      eventSource.removeListener(DISCORDIA_EVENTS.ENTITIES_LENGTH_CHANGED, handleEntitiesChanged);
      eventSource.removeListener(DISCORDIA_EVENTS.HOME_BUTTON_CLICKED, handleHomeButton);
      eventSource.removeListener(DISCORDIA_EVENTS.CHAT_SWITCH_PENDING, handleChatSwitchPending);

      if (body) {
        body.off('pointerdown', onPointerDown);
        body.off('pointermove', onPointerMove);
        body.off('touchstart', onTouchStart);
        body.off('touchmove', onTouchMove);
        body.off('touchend pointerup', onPointerUp);
      }
    };
  }, [processMenuIcons, refreshChats, setOpen, handleHomeButton, handleChatSwitchPending]);

  return {
    ...state,
    setOpen,
    hasActiveContext: chatViewModeRef.current === 'context',
    refreshChats,
  };
}
