import React, { useState } from 'react';
import { getRecentChats } from '../../utils/utils';

const ProfileMount = React.lazy(() => import('./ProfileMount'));
const ChannelBar = React.lazy(() => import('./ChannelBar'));
const ServerBar = React.lazy(() => import('../servers/ServerBar'));


const { getGroupPastChats } = await imports('@scripts/groupChats');

const {
  getEntitiesList,
  eventSource,
  event_types,
  getPastCharacterChats,
} = await imports('@script');

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
    chats: any[];
    icons: Icon[] | null;
  }>({ open: true, entities: [], chats: [], icons: [] });

  React.useEffect(() => {
    processMenuIcons();
    registerSwipeListener();
    eventSource.on(event_types.APP_READY, resetWithNewData);
    eventSource.on('chat_id_changed', updateData);
    eventSource.on(event_types.CHAT_DELETED, updateData);
    eventSource.on(event_types.CHAT_CREATED, updateData);
  }, []);

  const updateData = async () => {
    const {characterId, groupId} = SillyTavern.getContext();
    if (groupId !== null && typeof groupId !== 'undefined') {
      getGroupPastChats(groupId.toString()).then((chats) => {
        setState((prevState) => ({ ...prevState, chats: chats ?? [] }));
      });
      return;
    } else if (typeof characterId !== 'undefined' && parseInt(characterId) >= 0) {
      getPastCharacterChats().then((chats) => {
        setState((prevState) => ({ ...prevState, chats: chats ?? [] }));
      });
    } else {
      getRecentChats().then((chats) => {
        setState((prevState) => ({ ...prevState, chats }));
      });
    }
  }

  const registerSwipeListener = () => {
    const THRESHOLD = 100;
    const sheld = $('body');
    if (!sheld) return;

    let touchStartX: number = 0;
    let touchEndX: number = 0;

    sheld.on('pointerdown', (e) => {
      touchStartX = e.clientX ?? 0;
    });

    sheld.on('pointermove', (e) => {
      touchEndX = e.clientX ?? 0;
    });
    sheld.on('touchstart', (e) => {
      touchStartX = e.originalEvent?.touches[0]?.clientX ?? 0;
    });

    sheld.on('touchmove', (e) => {
      touchEndX = e.originalEvent?.touches[0]?.clientX ?? 0;
    });

    sheld.on('touchend pointerup', () => {
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

  const toggleOpen = () => {
    setState((prevState) => ({ ...prevState, open: !prevState.open }));
  };

  const setOpen = (value: boolean) => {
    setState((prevState) => ({ ...prevState, open: value }));
  };

  const resetWithNewData = () => {
    getRecentChats().then((chats) => {
      setState((prevState) => ({ ...prevState, chats }));
    });

    const entities = getEntitiesList({ doFilter: true, doSort: true });
    setState((prevState) => ({ ...prevState, entities }));
  };

  if (state.open) {
    const { characterId, groupId } = SillyTavern.getContext();
    return (
      <div id="sidebar-container">
        <div id="server-container">
          <ServerBar entities={state.entities} setOpen={setOpen} onHomeClick={resetWithNewData} />
          <ChannelBar
            title={(characterId || groupId) ? 'Chats' : 'Recent Chats'}
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
  } else {
    return null;
  }
};

export default SideBar;
