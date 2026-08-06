import { memo, useCallback, useMemo, useState } from 'react';
import Search from '../../../../components/common/search/search';
import IconButton from '../../../../components/common/IconButton/IconButton';
import Divider from '../../../../components/common/Divider/Divider';

interface WIEntryContainerProps {
  entries: string[];
  title?: string;
  onEdit?: (entry: string) => void;
  onDelete?: (entry: string) => void;
  onChangeActive?: (entry: string, isActive: boolean) => void;
  isActiveContainer?: boolean;
}

const WIEntryContainer = ({
  entries,
  title,
  onEdit,
  onDelete,
  onChangeActive,
  isActiveContainer,
}: WIEntryContainerProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = useCallback(
    (entry: string) => {
      onEdit?.(entry);
    },
    [onEdit],
  );

  const handleDelete = useCallback(
    (entry: string) => {
      onDelete?.(entry);
    },
    [onDelete],
  );

  const handleChangeActive = useCallback(
    (entry: string) => {
      onChangeActive?.(entry, !isActiveContainer);
    },
    [isActiveContainer, onChangeActive],
  );

  const filteredEntries = useMemo(() => {
    if (!searchTerm) {
      return entries;
    }

    return entries.filter((entry) =>
      entry.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [entries, searchTerm]);

  const renderEntries = useCallback(() => {
    if (filteredEntries.length === 0) {
      return (
        <div className="wi-entry w-full h-fit flex flex-col justify-center py-1">
          <span className="wi-entry-name shrink-0 truncate text-gray-400">
            No entries found.
          </span>
        </div>
      );
    }

    return filteredEntries.map((entry) => (
      <div
        key={entry}
        className="wi-entry w-full h-fit flex flex-col justify-center py-1 hover:bg-base-discordia-darker/10 dark:hover:bg-base-discordia-lighter/10"
      >
        <div className="wi-entry-header w-full flex justify-between items-center">
          <span className="wi-entry-name shrink-0 truncate">{entry}</span>
          <div className="wi-entry-actions flex space-x-2 pr-2">
            <IconButton
              faIcon="fa fa-solid fa-trash"
              color="salmon"
              size={18}
              onClick={() => handleDelete(entry)}
            />
            {isActiveContainer ? (
              <IconButton
                faIcon="fa fa-solid fa-minus"
                color="salmon"
                size={18}
                onClick={() => handleChangeActive(entry)}
              />
            ) : (
              <IconButton
                faIcon="fa fa-solid fa-plus"
                color="greenyellow"
                size={18}
                onClick={() => handleChangeActive(entry)}
              />
            )}

            <IconButton
              faIcon="fa fa-solid fa-arrow-right"
              color="skyblue"
              size={18}
              onClick={() => handleEdit(entry)}
            />
          </div>
        </div>
      </div>
    ));
  }, [
    filteredEntries,
    isActiveContainer,
    handleDelete,
    handleChangeActive,
    handleEdit,
  ]);

  return (
    <div className="wi-entry-container border border-lighter w-full h-fit flex flex-col justify-center py-1">
      {title && <h2 className="text-lg font-semibold mb-2 pl-2">{title}</h2>}
      <Search onInput={setSearchTerm} placeholder="Search Entries..." />
      <Divider />
      <div className="wi-entry-list w-full h-fit flex flex-col justify-center py-1 pl-2 space-y-1 overflow-auto max-h-96">
        {renderEntries()}
      </div>
    </div>
  );
};

export default memo(WIEntryContainer);
