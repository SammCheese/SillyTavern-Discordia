import { memo, useCallback } from 'react';
import Tag from './Tags';

interface TagListProps {
  tags: string[];
  onRemoveTag?: (tag: string) => void;
}

const TagList = ({ tags, onRemoveTag }: TagListProps) => {
  const handleRemoveTag = useCallback(
    (tag: string) => {
      onRemoveTag?.(tag);
    },
    [onRemoveTag],
  );

  return (
    <div className="flex flex-wrap mt-2">
      {tags.map((tag) => (
        <Tag key={tag} label={tag} onRemove={() => handleRemoveTag(tag)} />
      ))}
    </div>
  );
};

export default memo(TagList);
