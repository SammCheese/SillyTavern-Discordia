import { useCallback } from 'react';

interface TagProps {
  label: string;
  onRemove?: (label: string) => void;
}

const Tag = ({ label, onRemove }: TagProps) => {
  const handleRemoveClick = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation();
      onRemove?.(label);
    },
    [onRemove, label],
  );

  return (
    <div className="flex items-center me-2 mb-2 px-2 py-1 bg-base-discordia-lighter rounded">
      <div>
        {onRemove && (
          <span
            className="cursor-pointer  hover:text-gray-700 text-gray-400hover:text-gray-200 me-1"
            onClick={handleRemoveClick}
          >
            &times;
          </span>
        )}
      </div>
      <span className=" text-whie text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
        {label}
      </span>
    </div>
  );
};

export default Tag;
