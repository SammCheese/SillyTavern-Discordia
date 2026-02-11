import { memo, useCallback, useMemo, useState } from 'react';
import MemberCard from './Members/MemberCard';
import Search from '../../components/common/search/search';

import { List, type RowComponentProps } from 'react-window';

const MemberRow = memo(function MemberRow({
  index,
  style,
  character,
  onGroupAdd,
}: {
  index: number;
  style: React.CSSProperties;
  character: Character;
  onGroupAdd: (character: Character) => void;
}) {
  if (!character) {
    return null;
  }

  return (
    <div style={style} key={character.avatar || index}>
      <MemberCard
        character={character}
        type="character"
        onGroupAdd={onGroupAdd}
      />
    </div>
  );
});

interface RowData {
  data: Character[];
  onGroupAdd: (character: Character) => void;
}

const Row = ({
  index,
  style,
  data,
  onGroupAdd,
}: RowComponentProps<RowData>) => {
  const entity = data[index];

  const handleClick = useCallback(() => {
    if (entity) {
      onGroupAdd(entity);
    }
  }, [entity, onGroupAdd]);

  if (!entity) {
    return (
      <div style={style} onClick={handleClick}>
        Loading...
      </div>
    );
  }

  return (
    <MemberRow
      index={index}
      character={entity}
      style={style}
      onGroupAdd={handleClick}
    />
  );
};

interface AddMembersProps {
  onAdd: (character: Character) => void;
  existingMembers: Character[];
}

const AddMembers = ({ onAdd, existingMembers }: AddMembersProps) => {
  const characters = SillyTavern.getContext().characters;

  const filterCharacters = useMemo(() => {
    return characters.filter((char) => {
      return !existingMembers.find((member) => member.avatar === char.avatar);
    });
  }, [characters, existingMembers]);

  const [selectableCharacters, setSelectableCharacters] =
    useState<Character[]>(filterCharacters);

  const handleAddClick = useCallback(
    (char: Character) => {
      onAdd(char);
    },
    [onAdd],
  );

  const handleSearchInput = useCallback(
    (input: string) => {
      const filtered = filterCharacters.filter((char) => {
        const searchStr = input.toLowerCase();
        return (
          char.name.toLowerCase().includes(searchStr) ||
          char.description.toLowerCase().includes(searchStr)
        );
      });
      setSelectableCharacters(filtered);
    },
    [filterCharacters],
  );

  return (
    <div>
      <div>
        <Search onInput={handleSearchInput} />
      </div>
      <div className="flex flex-col gap-2 mt-4 h-96 overflow-y-auto">
        {selectableCharacters.length === 0 && (
          <div className="text-center text-sm text-gray-500">
            Looks like everyone&apos;s already in the group!
          </div>
        )}

        {selectableCharacters.length > 20 ? (
          <List
            rowComponent={Row}
            rowCount={selectableCharacters.length}
            rowHeight={60}
            rowProps={{
              data: selectableCharacters,
              onGroupAdd: handleAddClick,
            }}
            style={{ width: '100%', marginBottom: '8px' }}
            overscanCount={5}
          />
        ) : (
          selectableCharacters.map((char, index) => (
            <MemberCard
              key={char.avatar || index}
              character={char}
              onGroupAdd={handleAddClick}
              type="character"
            />
          ))
        )}
      </div>
    </div>
  );
};

export default memo(AddMembers);
