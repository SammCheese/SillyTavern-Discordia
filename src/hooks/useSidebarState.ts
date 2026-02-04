import { useCallback, useEffect, useReducer, useRef } from 'react';
import { getRecentChats } from '../services/chatService';
import { DISCORDIA_EVENTS } from '../events/eventTypes';

const { getGroupPastChats } = await imports('@scripts/groupChats');
const { getEntitiesList, eventSource, event_types, getPastCharacterChats } =
  await imports('@script');

type SidebarAction =
  | { type: 'SET_OPEN'; open: boolean }
  | { type: 'REFRESH_START' }
  | {
      type: 'REFRESH_SUCCESS';
      chats?: Chat[];
      entities?: Entity[];
      recentChats?: Chat[];
    }
  | { type: 'REFRESH_FAILURE'; error: Error }
  | { type: 'SET_ENTITIES'; entities: Entity[] }
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
        ...action,
        isLoadingChats: false,
      };
    case 'REFRESH_FAILURE':
      dislog.error('Failed to refresh sidebar chats:', action.error);
      return { ...state, isLoadingChats: false };
    case 'SET_ENTITIES':
      return { ...state, entities: action.entities };
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

export interface SidebarState {
  open: boolean;
  entities: Entity[];
  chats: Chat[];
  recentChats: Chat[];
  icons: Icon[];
  isLoadingChats: boolean;
  isInitialLoad: boolean;
  context: 'recent' | 'chat';
}

const INITIAL_STATE: SidebarState = {
  open: true,
  entities: [],
  chats: [],
  recentChats: [],
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

  const refreshCharacters = useCallback(() => {
    try {
      const entities = getEntitiesList({ doFilter: true, doSort: true });
      dispatch({ type: 'SET_ENTITIES', entities });
    } catch (error) {
      dislog.error('Failed to refresh characters:', error);
    }
  }, []);

  const refreshRecentChats = useCallback(async () => {
    dispatch({ type: 'REFRESH_START' });
    try {
      const recentChats = await getRecentChats();
      dispatch({ type: 'REFRESH_SUCCESS', recentChats });
    } catch (error) {
      dislog.error('Failed to refresh recent chats:', error);
    }
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

      let chats: Chat[] = [];

      if (hasGroup) {
        chats = (await getGroupPastChats(groupId.toString())) as Chat[];
      } else if (hasCharacter) {
        chats = await getPastCharacterChats();
      }

      dispatch({
        type: 'REFRESH_SUCCESS',
        chats,
      });
    } catch (error) {
      dispatch({ type: 'REFRESH_FAILURE', error: error as Error });
    } finally {
      isFetchingRef.current = false;

      if (pendingRefreshRef.current) {
        pendingRefreshRef.current = false;
        refreshChats();
      }
      dispatch({ type: 'SET_INITIAL_LOAD', isInitialLoad: false });
    }
  }, []);

  const showRecentChats = useCallback(async () => {
    dispatch({ type: 'SET_CONTEXT', context: 'recent' });
    refreshCharacters();
    refreshRecentChats();
  }, [refreshCharacters, refreshRecentChats]);

  const handleFullRefresh = useCallback(() => {
    refreshCharacters();
    refreshChats();
    refreshRecentChats();
  }, [refreshCharacters, refreshChats, refreshRecentChats]);

  const processMenuIcons = useCallback(() => {
    const settingsHolder = $('#top-settings-holder');
    if (!settingsHolder.length) return;

    const children = settingsHolder.children().toArray();
    const icons: Icon[] = children.map((el) => {
      const jEl = $(el);
      const id = `#${jEl.attr('id')}`;
      const infoEl = jEl.find('.drawer-icon');

      return {
        className: infoEl.attr('class') || '',
        title:
          infoEl.attr('title') ||
          jEl.find('.drawer-toggle').attr('title') ||
          '',
        showInProfile: PROFILE_MENU_CONFIG.some((item) => item.id === id),
        id: id,
      };
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

    const handleChatRefresh = () => refreshChats();

    // Event Handling
    eventSource.on(event_types.APP_READY, handleFullRefresh);
    eventSource.on(event_types.CHAT_CHANGED, handleChatRefresh);
    eventSource.on(event_types.CHAT_DELETED, handleChatRefresh);
    eventSource.on(event_types.CHAT_CREATED, handleChatRefresh);
    eventSource.on(event_types.SETTINGS_UPDATED, handleSettingsUpdate);
    eventSource.on(event_types.CHARACTER_EDITED, refreshCharacters);
    eventSource.on(event_types.CHARACTER_RENAMED, refreshCharacters);

    // Our own Events
    eventSource.on(DISCORDIA_EVENTS.ENTITY_CHANGED, refreshCharacters);
    eventSource.on(DISCORDIA_EVENTS.HOME_BUTTON_CLICKED, showRecentChats);
    eventSource.on(DISCORDIA_EVENTS.CHAT_UPDATE, handleChatRefresh);

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
      eventSource.removeListener(event_types.APP_READY, handleFullRefresh);
      eventSource.removeListener(event_types.CHAT_CHANGED, handleChatRefresh);
      eventSource.removeListener(event_types.CHAT_DELETED, handleChatRefresh);
      eventSource.removeListener(event_types.CHAT_CREATED, handleChatRefresh);
      eventSource.removeListener(
        event_types.SETTINGS_UPDATED,
        handleSettingsUpdate,
      );
      eventSource.removeListener(
        event_types.CHARACTER_EDITED,
        refreshCharacters,
      );
      eventSource.removeListener(
        event_types.CHARACTER_RENAMED,
        refreshCharacters,
      );
      eventSource.removeListener(
        DISCORDIA_EVENTS.ENTITY_CHANGED,
        refreshCharacters,
      );
      eventSource.removeListener(
        DISCORDIA_EVENTS.HOME_BUTTON_CLICKED,
        showRecentChats,
      );
      eventSource.removeListener(
        DISCORDIA_EVENTS.CHAT_UPDATE,
        handleChatRefresh,
      );

      if (body) {
        body.off('pointerdown', onPointerDown);
        body.off('pointermove', onPointerMove);
        body.off('touchstart', onTouchStart);
        body.off('touchmove', onTouchMove);
        body.off('touchend pointerup', onPointerUp);
      }
    };
  }, [
    handleFullRefresh,
    processMenuIcons,
    refreshChats,
    refreshCharacters,
    setOpen,
    showRecentChats,
  ]);

  return {
    ...state,
    setOpen,
  };
};
