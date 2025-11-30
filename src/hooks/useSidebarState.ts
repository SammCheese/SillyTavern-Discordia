import { useState, useEffect, useCallback } from 'react';
import { getRecentChats } from "../utils/utils";

const { getGroupPastChats } = await imports('@scripts/groupChats');
const { getEntitiesList, eventSource, event_types, getPastCharacterChats } = await imports('@script');

interface SidebarState {
  open: boolean;
  entities: Entity[];
  chats: Chat[];
  icons: Icon[];
}

export const useSidebarState = (channelMenu: { id: string }[]) => {
  const [state, setState] = useState<SidebarState>({
    open: false,
    entities: [],
    chats: [],
    icons: [],
  });

  const setOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, open }));
  }, []);

  const updateChatData = useCallback(async () => {
    const { characterId, groupId } = SillyTavern.getContext();
    let chats: Chat[] = [];

    try {
      if (groupId !== null) {
        chats = await getGroupPastChats(groupId.toString());
      } else if (typeof characterId !== 'undefined' && parseInt(characterId) >= 0) {
        chats = await getPastCharacterChats();
      } else {
        const entities = getEntitiesList({ doFilter: true, doSort: true });
        chats = await getRecentChats(entities);
      }
    } catch (error) {
      console.error('Error updating chat data:', error);
    }

    setState(prev => ({ ...prev, chats: chats ?? [] }));
  }, []);

    const resetWithNewData = useCallback(async () => {
    const entities = getEntitiesList({ doFilter: true, doSort: true });
    const chats = await getRecentChats(entities);
    setState(prev => ({ ...prev, chats, entities, open: true }));
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
        showInProfile: !channelMenu.some((item) => item.id === id),
        id: id,
      });
    });

    settingsHolder.attr('style', 'display: none !important;');
    setState(prev => ({ ...prev, icons }));
  }, [channelMenu]);

    useEffect(() => {
    processMenuIcons();


    const handleSettingsUpdate = () => {
      if (window.innerWidth > 1000 && !state.open) {
        setOpen(true);
      }
    };

    // Event Handling
    eventSource.on(event_types.APP_READY, resetWithNewData);
    eventSource.on(event_types.CHAT_CHANGED, updateChatData);
    eventSource.on(event_types.CHAT_DELETED, updateChatData);
    eventSource.on(event_types.CHAT_CREATED, updateChatData);
    eventSource.on(event_types.SETTINGS_UPDATED, handleSettingsUpdate);

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
      eventSource.removeListener(event_types.APP_READY, resetWithNewData);
      eventSource.removeListener(event_types.CHAT_CHANGED, updateChatData);
      eventSource.removeListener(event_types.CHAT_DELETED, updateChatData);
      eventSource.removeListener(event_types.CHAT_CREATED, updateChatData);
      eventSource.removeListener(event_types.SETTINGS_UPDATED, handleSettingsUpdate);

      if (body) {
        body.off('pointerdown', onPointerDown);
        body.off('pointermove', onPointerMove);
        body.off('touchstart', onTouchStart);
        body.off('touchmove', onTouchMove);
        body.off('touchend pointerup', onPointerUp);
      }
    };
  }, []);

  return {
    ...state,
    setOpen,
  };
}
