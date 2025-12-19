import {
  useCallback,
  useEffect,
  useMemo,
  lazy,
  memo,
  useState,
  useContext,
} from 'react';
import { List, type RowComponentProps } from 'react-window';
import { selectCharacter, selectGroup } from '../../utils/utils';
import { useSearch } from '../../context/SearchContext';
import ErrorBoundary from '../common/ErrorBoundary/ErrorBoundary';
import { DISCORDIA_EVENTS } from '../../events/eventTypes';
import { ModalContext } from '../../providers/modalProvider';
import CharacterModal from '../../modals/Character/CharacterModal';

const ServerIcon = lazy(() => import('./ServerIcon'));
const AddCharacterIcon = lazy(() => import('./AddCharacterIcon'));
const HomeIcon = lazy(() => import('./HomeIcon'));

const { getGroupPastChats } = await imports('@scripts/groupChats');
const {
  getPastCharacterChats,
  characters,
  closeCurrentChat,
  eventSource,
  event_types,
} = await imports('@script');

interface ServerRowProps {
  entity: Entity;
  index: number;
  isSelected: boolean;
  style: React.CSSProperties;
  onClick: (entity: Entity, index: number) => void;
}

const ServerRow = memo(
  function ServerRow({
    entity,
    index,
    isSelected,
    style,
    onClick,
  }: ServerRowProps) {
    return (
      <div
        style={style}
        className="discord-entity-item character-button w-full h-fit flex justify-center py-1"
        id={`character-button-${entity.id}`}
        title={entity.item?.name || entity.id}
      >
        <ServerIcon
          entity={entity}
          index={index}
          isSelected={isSelected}
          onClick={onClick}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.entity === nextProps.entity &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.onClick === nextProps.onClick
    );
  },
);

interface RowData {
  data: {
    entities: Entity[];
    selectedIndex: number | null;
    handleItemClick: (entity: Entity, index: number) => void;
  };
}

const Row = ({ index, style, data }: RowComponentProps<RowData>) => {
  const { entities, selectedIndex, handleItemClick } = data;
  const { openModal } = useContext(ModalContext);
  const entity = entities[index];

  const handleClick = useCallback(() => {
    if (entity) {
      handleItemClick(entity, index);
    }
  }, [entity, handleItemClick, index]);

  const handleAddCharacterClick = useCallback(() => {
    openModal(<CharacterModal type="create" />);
  }, [openModal]);

  if (!entity) {
    return (
      <div
        style={style}
        className="discord-entity-item character-button w-full h-fit flex justify-center py-1"
      >
        <AddCharacterIcon onClick={handleAddCharacterClick} />
      </div>
    );
  }

  return (
    <ServerRow
      index={index}
      entity={entity}
      style={style}
      isSelected={selectedIndex === index}
      onClick={handleClick}
    />
  );
};

const ServerBar = ({ entities }: { entities: Entity[] }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { searchQuery } = useSearch();
  const { openModal } = useContext(ModalContext);

  const onHomeClickHandler = useCallback(async () => {
    setSelectedIndex(null);
    await closeCurrentChat();
    // Signal Sidebar to go back to recent chats
    await eventSource.emit(DISCORDIA_EVENTS.HOME_BUTTON_CLICKED);
  }, []);

  const handleItemClick = useCallback(async (entity: Entity, index: number) => {
    try {
      if (entity.type === 'group') {
        const groupId = entity.id.toString();
        const group = SillyTavern.getContext().groups.find(
          (g) => g.id.toString() === groupId,
        );

        if (!group) return;

        // Prevent sidebar from falling back to recents while IDs are cleared.
        eventSource.emit(DISCORDIA_EVENTS.CHAT_SWITCH_PENDING);
        await closeCurrentChat();
        const chats = await getGroupPastChats(groupId);
        await selectGroup({ group: entity, chat_id: chats[0]?.file_id });

        setSelectedIndex(index);
      } else {
        const char_id = characters.findIndex(
          (c) => c.avatar === entity?.item?.avatar,
        );
        if (char_id === -1) return;

        eventSource.emit(DISCORDIA_EVENTS.CHAT_SWITCH_PENDING);
        await closeCurrentChat();
        const chats = await getPastCharacterChats(char_id);
        await selectCharacter(char_id, chats[0]?.file_id);

        setSelectedIndex(index);
      }
    } catch (error) {
      console.error('Error selecting entity:', error);
    }
  }, []);

  useEffect(() => {
    refreshSelectedIndex();
  }, [entities]);

  const refreshSelectedIndex = useCallback(() => {
    const { characterId, groupId } = SillyTavern.getContext();

    if (groupId !== null && typeof groupId !== 'undefined') {
      const idx = entities.findIndex(
        (e) => e.type === 'group' && e.id.toString() === groupId.toString(),
      );
      setSelectedIndex(idx !== -1 ? idx : null);
    } else if (
      characterId !== null &&
      typeof characterId !== 'undefined' &&
      parseInt(characterId) >= 0
    ) {
      const idx = entities.findIndex(
        (e) =>
          e.type === 'character' && e.id.toString() === characterId.toString(),
      );
      setSelectedIndex(idx !== -1 ? idx : null);
    } else {
      setSelectedIndex(null);
    }
  }, [entities]);

  useEffect(() => {
    // In case we miss an event e.g. context menu selection
    eventSource.on(event_types.CHAT_CHANGED, refreshSelectedIndex);

    return () => {
      eventSource.removeListener(
        event_types.CHAT_CHANGED,
        refreshSelectedIndex,
      );
    };
  }, [refreshSelectedIndex]);

  const itemData = useMemo(
    () => ({ entities, selectedIndex, handleItemClick }),
    [entities, selectedIndex, handleItemClick],
  );

  const filteredEntities = useMemo(() => {
    const withIndex = entities.map((entity, index) => ({ entity, index }));
    if (!searchQuery) return withIndex;
    return withIndex.filter(({ entity }) => {
      const name = entity.item?.name || '';
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [entities, searchQuery]);

  const handleAddCharacterClick = useCallback(() => {
    openModal(<CharacterModal type="create" />);
  }, []);

  return (
    <ErrorBoundary>
      <div id="character-container">
        <div id="characters-header">
          <HomeIcon onClick={onHomeClickHandler} />
          <div id="characters-divider" className="divider"></div>
        </div>

        <div id="characters-list" className="pt-0.5">
          {/* A little trickery in performance */}
          {filteredEntities.length < 50 ? (
            <>
              {filteredEntities.map(({ entity, index: actualIndex }) => {
                return (
                  <ServerRow
                    key={entity.id.toString()}
                    entity={entity}
                    index={actualIndex}
                    isSelected={selectedIndex === actualIndex}
                    onClick={handleItemClick}
                    style={{}}
                  />
                );
              })}

              <div id="characters-divider" className="divider"></div>

              <AddCharacterIcon onClick={handleAddCharacterClick} />
            </>
          ) : (
            <List
              rowComponent={Row}
              rowCount={filteredEntities.length + 1}
              rowHeight={60}
              rowProps={{ data: itemData }}
              style={{ width: '100%' }}
              overscanCount={5}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default memo(ServerBar);
