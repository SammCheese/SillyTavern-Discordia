import React from 'react';
import { List } from 'react-virtualized';
import { selectCharacter, selectGroup } from '../../utils/utils';

const MemoizedServerIcon = React.lazy(() => import('./ServerIcon'));
const AddCharacterIcon = React.lazy(() => import('./AddCharacterIcon'));
const HomeIcon = React.lazy(() => import('./HomeIcon'));

//const { openWelcomeScreen } = await imports('@scripts/welcomeScreen');
const { getGroupPastChats } = await imports('@scripts/groupChats');
const { getPastCharacterChats, characters, closeCurrentChat } =
  await imports('@script');

const Serverbar = ({ entities }: { entities: Entity[] }) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const onHomeClickHandler = async () => {
    setSelectedIndex(null);
    await closeCurrentChat();
  };

  const handleCharacterSelect = async (entity: Entity) => {
    try {
      const char_id = characters.findIndex(
        (c) => c.avatar === entity?.item?.avatar,
      );
      if (char_id === -1) {
        console.error('Character not found for entity:', entity);
        return;
      }

      await closeCurrentChat();

      getPastCharacterChats(char_id).then(async (chats) => {
        await selectCharacter(char_id, chats[0]?.file_id);
      });
    } catch (error) {
      console.error('Error selecting character:', error);
    }
  };

  const handleGroupSelect = async (entity: Entity) => {
    try {
      const groupId = entity.id.toString();
      const group = SillyTavern.getContext().groups.find(
        (g) => g.id.toString() === groupId,
      );

      if (!group) {
        console.error('Group not found for entity:', entity);
        return;
      }

      await closeCurrentChat();

      getGroupPastChats(groupId).then(async (chats) => {
        await selectGroup({ group: entity, chat_id: chats[0]?.file_id });
      });
    } catch (error) {
      console.error('Error selecting group:', error);
    }
  };

  React.useEffect(() => {
    const { characterId, groupId } = SillyTavern.getContext();
    let indexToSelect: number | null = null;

    if (groupId !== null && typeof groupId !== 'undefined') {
      const groupIndex = entities.findIndex(
        (e) => e.type === 'group' && e.id.toString() === groupId.toString(),
      );
      indexToSelect = groupIndex !== -1 ? groupIndex : null;
    } else if (
      typeof characterId !== 'undefined' &&
      parseInt(characterId) >= 0
    ) {
      const charIndex = entities.findIndex(
        (e) =>
          e.type === 'character' && e.id.toString() === characterId.toString(),
      );
      indexToSelect = charIndex !== -1 ? charIndex : null;
    } else {
      indexToSelect = null;
    }
    setSelectedIndex(indexToSelect);
  }, [entities]);

  // Virtualized list row renderer for Large number of entities
  const rowRenderer = ({ index, key, style }: Parameters<typeof List>[0]) => {
    const entity = entities[index];

    return entity ? (
      <div
        key={key}
        style={style}
        className="discord-entity-item character-button w-full h-fit"
        id={`character-button-${entity?.id}`}
        title={entity?.item?.name || entity?.id}
        onClick={() => {
          // Set selected Entity on Server Bar
          setSelectedIndex(index);

          if (entity?.type === 'group') {
            handleGroupSelect(entity);
            return;
          } else {
            handleCharacterSelect(entity);
            return;
          }
        }}
      >
        <MemoizedServerIcon
          entity={entity}
          isSelected={selectedIndex === index}
        />
      </div>
    ) : (
      <div
        key={key}
        style={style}
        className="w-full h-fit flex flex-col items-center"
      >
        <div id="characters-divider" className="divider"></div>

        <AddCharacterIcon onClick={() => {}} />
      </div>
    );
  };

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
              <div
                className="discord-entity-item character-button w-full h-fit"
                id={`character-button-${entity.id}`}
                title={entity.item?.name || entity.id}
                key={index}
                onClick={() => {
                  // Set selected Entity on Server Bar
                  setSelectedIndex(index);

                  if (entity.type === 'group') {
                    handleGroupSelect(entity);
                    return;
                  } else {
                    handleCharacterSelect(entity);
                    return;
                  }
                }}
              >
                <MemoizedServerIcon
                  entity={entity}
                  isSelected={selectedIndex === index}
                />
              </div>
            ))}

            <div id="characters-divider" className="divider"></div>

            <AddCharacterIcon onClick={() => {}} />
          </>
        ) : (
          <List
            width={80}
            height={window.innerHeight - 120}
            rowCount={entities.length + 1}
            rowHeight={60}
            rowRenderer={rowRenderer}
            overscanRowCount={5}
            scrollToIndex={selectedIndex !== null ? selectedIndex : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default Serverbar;
