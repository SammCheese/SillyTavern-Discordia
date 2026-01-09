import { useCallback, useEffect, useReducer, useRef } from 'react';
import { getRecentChats } from '../utils/utils';
import { DISCORDIA_EVENTS } from '../events/eventTypes';

const { getGroupPastChats } = await imports('@scripts/groupChats');
const { getEntitiesList, eventSource, event_types, getPastCharacterChats } =
  await imports('@script');

type SidebarAction =
  | { type: 'SET_OPEN'; open: boolean }
  | { type: 'REFRESH_START' }
  | { type: 'REFRESH_SUCCESS'; chats: Chat[]; entities: Entity[] }
  | { type: 'REFRESH_FAILURE'; error: Error }
  | { type: 'SET_ICONS'; icons: Icon[] }
  | { type: 'SET_CONTEXT'; context: 'recent' | 'chat' }
  | { type: 'SET_INITIAL_LOAD'; isInitialLoad: boolean };

const PROFILE_MENU_CONFIG = [
  { name: 'User Settings', id: '#user-settings-button' },
  { name: 'Profile', id: '#sys-settings-button' },
  { name: 'Account', id: '#ai-config-button' },
];

const sidebarReducer = (
  state: SidebarState,
  action: SidebarAction,
): SidebarState => {
  switch (action.type) {
    case 'SET_OPEN':
      return { ...state, open: action.open };
    case 'REFRESH_START':
      return { ...state, isLoadingChats: true };
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        chats: action.chats,
        entities: action.entities,
        isLoadingChats: false,
      };
    case 'REFRESH_FAILURE':
      console.error('Failed to refresh sidebar chats:', action.error);
      return { ...state, isLoadingChats: false };
    case 'SET_ICONS':
      return { ...state, icons: action.icons };
    case 'SET_INITIAL_LOAD':
      return { ...state, isInitialLoad: action.isInitialLoad };
    case 'SET_CONTEXT':
      return { ...state, context: action.context };
    default:
      return state;
  }
};

interface SidebarState {
  open: boolean;
  entities: Entity[];
  chats: Chat[];
  icons: Icon[];
  isLoadingChats: boolean;
  isInitialLoad: boolean;
  context: 'recent' | 'chat';
}

const INITIAL_STATE: SidebarState = {
  open: true,
  entities: [],
  chats: [],
  icons: [],
  isLoadingChats: true,
  isInitialLoad: true,
  context: 'recent',
};

export const useSidebarState = () => {
  const [state, dispatch] = useReducer(sidebarReducer, INITIAL_STATE);

  const isFetchingRef = useRef(false);
  const pendingRefreshRef = useRef(false);
  const openRef = useRef(state.open);

  useEffect(() => {
    openRef.current = state.open;
  }, [state.open]);

  const setOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_OPEN', open });
  }, []);

  const refreshChats = useCallback(async (forceRecent = false) => {
    if (isFetchingRef.current && !forceRecent) {
      pendingRefreshRef.current = true;
      return;
    }

    dispatch({ type: 'SET_CONTEXT', context: forceRecent ? 'recent' : 'chat' });

    isFetchingRef.current = true;
    dispatch({ type: 'REFRESH_START' });

    try {
      const { characterId, groupId } = SillyTavern.getContext();
      const hasGroup = groupId !== null && groupId !== undefined;
      const hasCharacter =
        characterId !== null &&
        characterId !== undefined &&
        Number(characterId) >= 0;

      const entities = getEntitiesList({ doFilter: true, doSort: true });
      let chats: Chat[] = [];

      if (hasGroup) {
        chats = await getGroupPastChats(groupId.toString());
      } else if (hasCharacter) {
        chats = await getPastCharacterChats();
      } else if (forceRecent) {
        chats = await getRecentChats(entities);
      }

      dispatch({ type: 'REFRESH_SUCCESS', chats, entities });
    } catch (error) {
      dispatch({ type: 'REFRESH_FAILURE', error: error as Error });
    } finally {
      isFetchingRef.current = false;

      if (pendingRefreshRef.current) {
        pendingRefreshRef.current = false;
      }
      dispatch({ type: 'SET_INITIAL_LOAD', isInitialLoad: false });
    }
  }, []);

  const handleFullRefresh = useCallback(() => {
    refreshChats(true);
  }, [refreshChats]);

  const handleChatChange = useCallback(() => {
    refreshChats();
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
        title:
          infoEl.attr('title') ||
          jEl.find('.drawer-toggle').attr('title') ||
          '',
        showInProfile: PROFILE_MENU_CONFIG.some((item) => item.id === id),
        id: id,
      });
    });

    settingsHolder.attr('style', 'display: none !important;');
    dispatch({ type: 'SET_ICONS', icons });
  }, []);

  useEffect(() => {
    processMenuIcons();

    const handleSettingsUpdate = () => {
      if (openRef.current) return;

      if (window.innerWidth > 1000) {
        setOpen(true);
      }
    };

    // Event Handling
    eventSource.on(event_types.APP_READY, handleFullRefresh);
    eventSource.on(event_types.CHAT_CHANGED, refreshChats);
    eventSource.on(event_types.CHAT_DELETED, refreshChats);
    eventSource.on(event_types.CHAT_CREATED, refreshChats);
    eventSource.on(event_types.SETTINGS_UPDATED, handleSettingsUpdate);
    eventSource.on(event_types.CHARACTER_EDITED, refreshChats);
    eventSource.on(event_types.CHARACTER_RENAMED, refreshChats);

    // Our own Events
    eventSource.on(DISCORDIA_EVENTS.ENTITY_CHANGED, handleFullRefresh);
    eventSource.on(DISCORDIA_EVENTS.HOME_BUTTON_CLICKED, handleFullRefresh);
    eventSource.on(DISCORDIA_EVENTS.CHAT_UPDATE, handleChatChange);

    // Swipe Listeners
    const THRESHOLD = 100;
    const body = $('body');
    let touchStartX = 0;
    let touchEndX = 0;

    const onPointerDown = (e) => {
      touchStartX = e.clientX ?? 0;
    };
    const onPointerMove = (e) => {
      touchEndX = e.clientX ?? 0;
    };
    const onTouchStart = (e) => {
      touchStartX = e.originalEvent?.touches[0]?.clientX ?? 0;
    };
    const onTouchMove = (e) => {
      touchEndX = e.originalEvent?.touches[0]?.clientX ?? 0;
    };

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
      eventSource.removeListener(
        event_types.SETTINGS_UPDATED,
        handleSettingsUpdate,
      );
      eventSource.removeListener(event_types.CHARACTER_EDITED, refreshChats);
      eventSource.removeListener(event_types.CHARACTER_RENAMED, refreshChats);
      eventSource.removeListener(
        DISCORDIA_EVENTS.ENTITY_CHANGED,
        handleFullRefresh,
      );
      eventSource.removeListener(
        DISCORDIA_EVENTS.HOME_BUTTON_CLICKED,
        handleFullRefresh,
      );
      eventSource.removeListener(
        DISCORDIA_EVENTS.CHAT_UPDATE,
        handleChatChange,
      );

      if (body) {
        body.off('pointerdown', onPointerDown);
        body.off('pointermove', onPointerMove);
        body.off('touchstart', onTouchStart);
        body.off('touchmove', onTouchMove);
        body.off('touchend pointerup', onPointerUp);
      }
    };
  }, [handleFullRefresh, processMenuIcons, refreshChats, setOpen]);

  return {
    ...state,
    setOpen,
  };
};
