import { memo, useCallback, useState } from 'react';
import Input from '../../components/common/Input/Input';
import TagList from '../../components/characters/TagList';

interface TagManagerProps {
  characterData: Character | null;
  setCharData: (data: Partial<Character>) => void;
}

const TagManager = ({ characterData, setCharData }: TagManagerProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = useCallback(
    (e: string) => {
      setInputValue(e);
      if (e.trim() === '') return;
      if (characterData?.tags?.includes(e.trim())) return;

      if (e.includes(',')) {
        const newTags = e
          .split(',')
          .map((tag) => tag.trim())
          .filter(
            (tag) => tag !== '' && !(characterData?.tags || []).includes(tag),
          );
        if (newTags.length === 0) return;

        setCharData({
          tags: [...(characterData?.tags || []), ...newTags],
        });
        setInputValue('');
      }
    },
    [characterData?.tags, setCharData],
  );

  const handleRemoveTag = useCallback(
    (tag: string) => {
      setCharData({
        tags: (characterData?.tags || []).filter((t) => t !== tag),
      });
    },
    [characterData?.tags, setCharData],
  );

  return (
    <>
      <Input
        onChange={handleInputChange}
        placeholder="Add tags separated by commas"
        value={inputValue}
      />

      <div>
        <TagList
          tags={characterData?.tags ?? []}
          onRemoveTag={handleRemoveTag}
        />
      </div>
    </>
  );
};

export default memo(TagManager);
