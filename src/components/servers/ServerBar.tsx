import React, { useCallback, useEffect, useMemo } from 'react';
import { List, type RowComponentProps } from 'react-window';
import { selectCharacter, selectGroup } from '../../utils/utils';

const ServerIcon = React.lazy(() => import('./ServerIcon'));
const AddCharacterIcon = React.lazy(() => import('./AddCharacterIcon'));
const HomeIcon = React.lazy(() => import('./HomeIcon'));

//const { openWelcomeScreen } = await imports('@scripts/welcomeScreen');
const { getGroupPastChats } = await imports('@scripts/groupChats');
const { getPastCharacterChats, characters, closeCurrentChat } =
  await imports('@script');

const ServerRow = React.memo(function ServerRow({
  entity,
  index,
  isSelected,
  style,
  onClick,
}: {
  entity: Entity;
  index: number;
  isSelected: boolean;
  style: React.CSSProperties;
  onClick: (entity: Entity, index: number) => void;
}) {
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
        onSelect={onClick}
      />
    </div>
  );
});

interface RowData {
  data: {
    entities: Entity[];
    selectedIndex: number | null;
    handleItemClick: (entity: Entity, index: number) => void;
  };
}

const Row = ({ index, style, data }: RowComponentProps<RowData>) => {
  const { entities, selectedIndex, handleItemClick } = data;
  const entity = entities[index];

  if (!entity) {
    return (
      <div
        style={style}
        className="discord-entity-item character-button w-full h-fit flex justify-center py-1"
      >
        <AddCharacterIcon onClick={() => {}} />
      </div>
    );
  }

  return (
    <ServerRow
      index={index}
      entity={entity}
      style={style}
      isSelected={selectedIndex === index}
      onClick={handleItemClick}
    />
  );
};

const ServerBar = ({ entities }: { entities: Entity[] }) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const onHomeClickHandler = useCallback(async () => {
    setSelectedIndex(null);
    await closeCurrentChat();
  }, []);

  const handleItemClick = useCallback(async (entity: Entity, index: number) => {
    setSelectedIndex(index);
    try {
      if (entity.type === 'group') {
        const groupId = entity.id.toString();
        const group = SillyTavern.getContext().groups.find(
          (g) => g.id.toString() === groupId,
        );

        if (!group) return;

        await closeCurrentChat();
        const chats = await getGroupPastChats(groupId);
        await selectGroup({ group: entity, chat_id: chats[0]?.file_id });
      } else {
        const char_id = characters.findIndex(
          (c) => c.avatar === entity?.item?.avatar,
        );
        if (char_id === -1) return;

        await closeCurrentChat();
        const chats = await getPastCharacterChats(char_id);
        await selectCharacter(char_id, chats[0]?.file_id);
      }
    } catch (error) {
      console.error('Error selecting entity:', error);
    }
  }, []);

  useEffect(() => {
    const { characterId, groupId } = SillyTavern.getContext();

    if (groupId !== null && typeof groupId !== 'undefined') {
      const idx = entities.findIndex(
        (e) => e.type === 'group' && e.id.toString() === groupId.toString(),
      );
      setSelectedIndex(idx !== -1 ? idx : null);
    } else if (
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

  const itemData = useMemo(
    () => ({ entities, selectedIndex, handleItemClick }),
    [entities, selectedIndex, handleItemClick],
  );

  // Virtualized list row renderer for Large number of entities

  return (
    <div id="character-container">
      <div id="characters-header">
        <HomeIcon onClick={onHomeClickHandler} />
        <div id="characters-divider" className="divider"></div>
      </div>

      <div id="characters-list" className="pt-0.5">
        {/* A little trickery in performance */}
        {entities.length < 50 ? (
          <>
            {entities.map((entity, index) => (
              <ServerRow
                key={entity.id.toString()}
                entity={entity}
                index={index}
                isSelected={selectedIndex === index}
                onClick={handleItemClick}
                style={{}}
              />
            ))}

            <div id="characters-divider" className="divider"></div>

            <AddCharacterIcon onClick={() => {}} />
          </>
        ) : (
          <List
            rowComponent={Row}
            rowCount={entities.length + 1}
            rowHeight={60}
            rowProps={{ data: itemData }}
            style={{ width: '100%' }}
            overscanCount={5}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(ServerBar);
