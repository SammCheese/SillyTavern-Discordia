import React, { useState } from 'react';
import { getRecentChats } from '../../utils/utils';

const ProfileMount = React.lazy(() => import('./ProfileMount'));
const ChannelBar = React.lazy(() => import('./ChannelBar'));
const ServerBar = React.lazy(() => import('../servers/ServerBar'));

const { getGroupPastChats } = await imports('@scripts/groupChats');

const { getEntitiesList, eventSource, event_types, getPastCharacterChats } =
  await imports('@script');

const SideBar = () => {
  const channelMenu = [
    { name: 'Backgrounds', id: '#backgrounds-button' },
    { name: 'Persona Management', id: '#persona-management-button' },
    { name: 'Character Selector', id: '#rightNavHolder' },
    { name: 'Extensions Settings', id: '#extensions-settings-button' },
    { name: 'Advanced Formatting', id: '#advanced-formatting-button' },
    { name: 'World Info', id: '#WI-SP-button' },
  ];

  const [state, setState] = useState<{
    open: boolean;
    entities: Entity[];
    chats: Chat[];
    icons: Icon[] | null;
    width?: number | undefined;
  }>({ open: false, entities: [], chats: [], icons: [], width: undefined });

  React.useEffect(() => {
    processMenuIcons();
    registerSwipeListener();
    eventSource.on(event_types.APP_READY, resetWithNewData);
    eventSource.on('chat_id_changed', updateData);
    eventSource.on(event_types.CHAT_DELETED, updateData);
    eventSource.on(event_types.CHAT_CREATED, updateData);
    eventSource.on(event_types.SETTINGS_UPDATED, handleSettingsUpdate);

    return () => {
      const body = $('body');
      if (body) {
        body.off('pointerdown touchstart');
        body.off('pointermove touchmove');
        body.off('touchend touchcancel pointerup');
      }

      eventSource.removeListener(event_types.APP_READY, resetWithNewData);
      eventSource.removeListener('chat_id_changed', updateData);
      eventSource.removeListener(event_types.CHAT_DELETED, updateData);
      eventSource.removeListener(event_types.CHAT_CREATED, updateData);
      eventSource.removeListener(
        event_types.SETTINGS_UPDATED,
        handleSettingsUpdate,
      );
    };
  }, []);

  const handleSettingsUpdate = () => {
    // Also called when window resizes
    // Ensure sidebar is open on large screens
    if (window.innerWidth > 1000 && !state.open) {
      setOpen(true);
    }
  };

  const updateData = async () => {
    const { characterId, groupId } = SillyTavern.getContext();
    if (groupId !== null && typeof groupId !== 'undefined') {
      getGroupPastChats(groupId.toString()).then((chats) => {
        setState((prevState) => ({ ...prevState, chats: chats ?? [] }));
      });
      return;
    } else if (
      typeof characterId !== 'undefined' &&
      parseInt(characterId) >= 0
    ) {
      getPastCharacterChats().then((chats) => {
        setState((prevState) => ({ ...prevState, chats: chats ?? [] }));
      });
    } else {
      getRecentChats().then((chats) => {
        setState((prevState) => ({ ...prevState, chats }));
      });
    }
  };

  const registerSwipeListener = () => {
    const THRESHOLD = 100;
    const body = $('body');
    if (!body) return;

    let touchStartX: number = 0;
    let touchEndX: number = 0;

    body.on('pointerdown', (e) => {
      touchStartX = e.clientX ?? 0;
    });

    body.on('pointermove', (e) => {
      touchEndX = e.clientX ?? 0;
    });
    body.on('touchstart', (e) => {
      touchStartX = e.originalEvent?.touches[0]?.clientX ?? 0;
    });

    body.on('touchmove', (e) => {
      touchEndX = e.originalEvent?.touches[0]?.clientX ?? 0;
    });

    body.on('touchend pointerup', () => {
      if (touchStartX === 0 || touchEndX === 0) return;

      if (touchEndX > touchStartX + THRESHOLD) {
        // Swipe right
        setOpen(true);
      } else if (touchEndX < touchStartX - THRESHOLD) {
        // Swipe left
        if (window.innerWidth > 1000) return;
        setOpen(false);
      }
    });
  };

  const processMenuIcons = () => {
    const settingsHolder = $('#top-settings-holder');
    if (!settingsHolder) return null;

    const icons: Icon[] = [];
    settingsHolder.children().each((_, el) => {
      const jEl = $(el);
      const id = `#${jEl.attr('id')}`;
      const infoEl = jEl.find('.drawer-icon');
      icons.push({
        className: infoEl.attr('class') || '',
        // Background Options are special.
        title:
          infoEl.attr('title') ||
          jEl.find('.drawer-toggle').attr('title') ||
          '',
        showInProfile: !channelMenu.some((item) => item.id === id),
        id: id,
      });
    });
    settingsHolder.attr('style', 'display: none !important;');
    setState((prevState) => ({ ...prevState, icons }));
  };

  const setOpen = (value: boolean) => {
    setState((prevState) => ({ ...prevState, open: value }));
  };

  const resetWithNewData = () => {
    setState((prevState) => ({ ...prevState, open: true }));
    getRecentChats().then((chats) => {
      setState((prevState) => ({ ...prevState, chats }));
    });

    const entities = getEntitiesList({ doFilter: true, doSort: true });
    setState((prevState) => ({ ...prevState, entities }));
  };

  const { characterId, groupId } = SillyTavern.getContext();
  return (
    <div
      id="sidebar-container"
      className={`fixed top-0 left-0 h-full  transition-transform duration-150 ease-in-out ${
        state.open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div id="server-container">
        <ServerBar entities={state.entities} />
        <ChannelBar
          title={characterId || groupId ? 'Chats' : 'Recent Chats'}
          icons={state.icons}
          chats={state.chats}
          setOpen={setOpen}
        />
      </div>
      <div id="user-container">
        <ProfileMount avatar={null} icons={state.icons} />
      </div>
    </div>
  );
};

export default SideBar;
