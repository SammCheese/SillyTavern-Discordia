import React from 'react';
import { List } from 'react-virtualized';
import { selectCharacter, selectGroup } from '../../utils/utils';

const MemoizedServerIcon = React.lazy(() => import('./ServerIcon'));

//const { openWelcomeScreen } = await imports('@scripts/welcomeScreen');
const { getGroupPastChats } = await imports('@scripts/groupChats');
const { getPastCharacterChats, characters, closeCurrentChat } =
  await imports('@script');

const HomeIcon = ({ onClick }: { onClick?: (() => void) | undefined }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  return (
    <div
      className="discord-entity-item avatar home-button"
      id="home-button"
      title="Home"
      onClick={handleClick}
    >
      <svg
        aria-hidden="true"
        width="32"
        height="32"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.4-.25-5.1 0-.18-.41-.37-.82-.59-1.2-1.6.27-3.14.75-4.6 1.43A19.04 19.04 0 0 0 .96 17.7a18.43 18.43 0 0 0 5.63 2.87c.46-.62.86-1.28 1.2-1.98-.65-.25-1.29-.55-1.9-.92.17-.12.32-.24.47-.37 3.58 1.7 7.7 1.7 11.28 0l.46.37c-.6.36-1.25.67-1.9.92.35.7.75 1.35 1.2 1.98 2.03-.63 3.94-1.6 5.64-2.87.47-4.87-.78-9.09-3.3-12.83ZM8.3 15.12c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.89 2.27-2 2.27Zm7.4 0c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.88 2.27-2 2.27Z"
          className=""
        ></path>
      </svg>
    </div>
  );
};

const AddCharacterIcon = ({
  onClick,
}: {
  onClick: (() => void) | undefined;
}) => {
  return (
    <div
      className="discord-entity-item avatar new-character-button"
      id="new-character-button"
      title="Add Character"
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      <svg
        aria-hidden="true"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" fill="transparent" className=""></circle>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm0-17a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H7a1 1 0 1 1 0-2h4V7a1 1 0 0 1 1-1Z"
          clipRule="evenodd"
          className=""
        ></path>
      </svg>
    </div>
  );
};

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
