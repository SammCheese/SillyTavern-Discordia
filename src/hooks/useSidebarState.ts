import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { getRecentChats, invalidateEntityCache } from '../services/chatService';
import { DISCORDIA_EVENTS } from '../events/eventTypes';
import { getDiscordiaSettings } from '../services/extensionSettingService';

import { useSTEvents } from './useSTEvents';
import { useSwipeGesture } from './useSwipeGesture';

import { getGroupPastChats } from '../st/groupChats';
import {
  getEntitiesList,
  event_types,
  getPastCharacterChats,
} from '../st/script';
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
        ...(action.chats !== undefined && { chats: action.chats }),
        ...(action.entities !== undefined && { entities: action.entities }),
        ...(action.recentChats !== undefined && {
          recentChats: action.recentChats,
        }),
        isLoadingChats: false,
      };
    case 'REFRESH_FAILURE':
      dislog.error('Failed to refresh sidebar chats:', action.error);
      return { ...state, isLoadingChats: false };
    case 'SET_ENTITIES': {
      const hiddenCharacters = getDiscordiaSettings().hiddenCharacters;
      const filteredEntities = action.entities.filter(
        (entity) =>
          !hiddenCharacters.includes(entity.item?.avatar?.toString() || ''),
      );
      return { ...state, entities: filteredEntities };
    }
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
  const activeFetchIdRef = useRef(0);
  const refreshChatsRef = useRef<(forceRecent?: boolean) => void>(() => {});
  const openRef = useRef(state.open);

  useEffect(() => {
    openRef.current = state.open;
  }, [state.open]);

  const setOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_OPEN', open });
  }, []);

  const refreshCharacters = useCallback(() => {
    try {
      invalidateEntityCache();
      const entities = getEntitiesList({ doFilter: true, doSort: true });
      dispatch({ type: 'SET_ENTITIES', entities });
    } catch (error) {
      dislog.error('Failed to refresh characters:', error);
    }
  }, []);

  const refreshContext = useCallback(() => {
    const { characterId, groupId } = SillyTavern.getContext();
    if (typeof characterId !== 'undefined' || groupId !== null) {
      dispatch({ type: 'SET_CONTEXT', context: 'chat' });
    } else if (state.isLoadingChats && !state.isInitialLoad) {
      dispatch({ type: 'SET_CONTEXT', context: 'chat' });
    } else {
      dispatch({ type: 'SET_CONTEXT', context: 'recent' });
    }
  }, [state.isLoadingChats, state.isInitialLoad]);

  const refreshRecentChats = useCallback(async () => {
    dispatch({ type: 'REFRESH_START' });
    try {
      const recentChats = await getRecentChats();
      const hiddenCharacters = getDiscordiaSettings().hiddenCharacters;
      const filteredRecentChats = recentChats.filter((chat: Chat) => {
        return !hiddenCharacters.some((avatar) =>
          chat?.avatar?.includes(avatar),
        );
      });
      dispatch({ type: 'REFRESH_SUCCESS', recentChats: filteredRecentChats });
    } catch (error) {
      dispatch({ type: 'REFRESH_FAILURE', error: error as Error });
      dislog.error('Failed to refresh recent chats:', error);
    }
  }, []);

  const refreshChats = useCallback((forceRecent = false) => {
    if (isFetchingRef.current && !forceRecent) {
      pendingRefreshRef.current = true;
      return;
    }

    dispatch({ type: 'SET_CONTEXT', context: forceRecent ? 'recent' : 'chat' });

    isFetchingRef.current = true;
    const fetchId = ++activeFetchIdRef.current;
    dispatch({ type: 'REFRESH_START' });

    const finalizeRefresh = () => {
      if (activeFetchIdRef.current !== fetchId) return;

      isFetchingRef.current = false;

      if (pendingRefreshRef.current) {
        pendingRefreshRef.current = false;
        refreshChatsRef.current();
      }
      dispatch({ type: 'SET_INITIAL_LOAD', isInitialLoad: false });
    };

    try {
      const { characterId, groupId } = SillyTavern.getContext();
      const hasGroup = groupId !== null && groupId !== undefined;
      const hasCharacter =
        characterId !== null &&
        characterId !== undefined &&
        Number(characterId) >= 0;

      let chats: Promise<Chat[]> = Promise.resolve([]);

      if (hasGroup) {
        chats = getGroupPastChats(groupId.toString()) as Promise<Chat[]>;
      } else if (hasCharacter) {
        chats = getPastCharacterChats();
      }

      chats
        .then((chats) => {
          if (activeFetchIdRef.current !== fetchId) return;
          dispatch({
            type: 'REFRESH_SUCCESS',
            chats,
          });
        })
        .catch((error) => {
          if (activeFetchIdRef.current !== fetchId) return;
          dislog.error('Failed to refresh chats:', error);
          dispatch({ type: 'REFRESH_FAILURE', error });
        })
        .finally(finalizeRefresh);
    } catch (error) {
      dispatch({ type: 'REFRESH_FAILURE', error: error as Error });
      finalizeRefresh();
    }
  }, []);

  const showRecentChats = useCallback(async () => {
    dispatch({ type: 'SET_CONTEXT', context: 'recent' });
    refreshCharacters();
    refreshRecentChats();
  }, [refreshCharacters, refreshRecentChats]);

  useEffect(() => {
    refreshChatsRef.current = refreshChats;
  }, [refreshChats]);

  const handleFullRefresh = useCallback(() => {
    refreshCharacters();
    refreshChats(true);
    refreshRecentChats();
  }, [refreshCharacters, refreshChats, refreshRecentChats]);

  const processMenuIcons = useCallback(() => {
    const settingsHolder = $('#top-settings-holder');
    if (!settingsHolder.length) return;
    const children = settingsHolder.children();

    const icons: Icon[] = [];
    children.each((_, el) => {
      const jEl = $(el);
      const id = jEl.attr('id');
      if (!id) return;
      icons.push({
        className: jEl.find('.drawer-icon').attr('class') || '',
        title:
          jEl.find('.drawer-icon').attr('title') ||
          jEl.find('.drawer-toggle').attr('title') ||
          '',
        showInProfile: PROFILE_MENU_CONFIG.some(
          (item) => item.id === `#${jEl.attr('id')}`,
        ),
        id: `#${jEl.attr('id')}`,
      });
    });

    dispatch({ type: 'SET_ICONS', icons });
  }, []);

  const handleSettingsUpdate = useCallback(() => {
    if (openRef.current) return;
    if (window.innerWidth > 1000) {
      setOpen(true);
    }
  }, [setOpen]);

  const EventMap = useMemo(() => {
    return {
      [event_types.APP_READY]: handleFullRefresh,
      [event_types.CHAT_CHANGED]: refreshChats,
      [event_types.CHAT_DELETED]: refreshChats,
      [event_types.CHAT_CREATED]: refreshChats,
      [event_types.CHAT_RENAMED]: refreshChats,
      [event_types.GROUP_CHAT_DELETED]: refreshChats,
      [event_types.GROUP_CHAT_CREATED]: refreshChats,
      [event_types.SETTINGS_UPDATED]: handleSettingsUpdate,
      [event_types.CHARACTER_EDITED]: refreshCharacters,
      [event_types.CHARACTER_RENAMED]: refreshCharacters,

      // Our own Events
      [DISCORDIA_EVENTS.ENTITY_CHANGED]: refreshCharacters,
      [DISCORDIA_EVENTS.HOME_BUTTON_CLICKED]: showRecentChats,
      [DISCORDIA_EVENTS.CHAT_UPDATE]: refreshChats,
      [DISCORDIA_EVENTS.RECENTS_REFRESH]: refreshRecentChats,
    };
  }, [
    handleFullRefresh,
    refreshChats,
    refreshCharacters,
    handleSettingsUpdate,
    showRecentChats,
    refreshRecentChats,
  ]);

  useSTEvents(EventMap);

  useSwipeGesture({
    onSwipeRight: useCallback(() => setOpen(true), [setOpen]),
    onSwipeLeft: useCallback(() => {
      if (window.innerWidth <= 1000) setOpen(false);
    }, [setOpen]),
  });

  useEffect(() => {
    processMenuIcons();
  }, [processMenuIcons]);

  return {
    ...state,
    setOpen,
    refreshContext,
  };
};
