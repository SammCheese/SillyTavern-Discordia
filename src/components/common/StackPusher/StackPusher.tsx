import { memo, useCallback, useEffect, useState } from 'react';

interface StackPusherProps {
  inactiveEntries?: string[];
  activeLabel?: string;
  inactiveLabel?: string;
  activeEntries?: string[];
  onStackChange?: (activeEntries: string[], inactiveEntries: string[]) => void;
}

const StackPusher = ({
  inactiveEntries,
  activeEntries,
  activeLabel = 'Active Entries',
  inactiveLabel = 'Inactive Entries',
  onStackChange,
}: StackPusherProps) => {
  const [activeEntriesState, setActiveEntriesState] = useState(
    activeEntries || [],
  );
  const [inactiveEntriesState, setInactiveEntriesState] = useState(
    inactiveEntries || [],
  );

  const handleStackChange = useCallback(
    (newActiveEntries: string[], newInactiveEntries: string[]) => {
      setActiveEntriesState(newActiveEntries);
      setInactiveEntriesState(newInactiveEntries);
      onStackChange?.(newActiveEntries, newInactiveEntries);
    },
    [onStackChange],
  );

  const handleSetActive = useCallback(
    (entry: string) => {
      const newActive = [...activeEntriesState, entry];
      const newInactive = inactiveEntriesState.filter((e) => e !== entry);
      handleStackChange(newActive, newInactive);
    },
    [activeEntriesState, inactiveEntriesState, handleStackChange],
  );

  const handleSetInactive = useCallback(
    (entry: string) => {
      const newInactive = [...inactiveEntriesState, entry];
      const newActive = activeEntriesState.filter((e) => e !== entry);
      handleStackChange(newActive, newInactive);
    },
    [activeEntriesState, inactiveEntriesState, handleStackChange],
  );

  useEffect(() => {
    setActiveEntriesState(activeEntries || []);
    setInactiveEntriesState(inactiveEntries || []);
  }, [activeEntries, inactiveEntries]);

  return (
    <div className="flex flex-row w-full h-96 rounded overflow-hidden flex-nowrap border border-lighter">
      <div className="flex flex-col overflow-auto w-full h-full border-r border-lighter">
        <div className="mb-2 border-b border-gray-300">
          <h3 className="text-lg font-semibold p-2 text-center">
            {activeLabel}
          </h3>
        </div>
        <div className="flex flex-col overflow-auto w-full h-full">
          {activeEntriesState.map((entry, index) => (
            <div
              key={index}
              className="p-2 flex hover:bg-base-discordia-lighter"
            >
              <div className="truncate">{entry}</div>
              <div className="ml-auto">
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={handleSetInactive.bind(null, entry)}
                >
                  &#8212;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col mt-auto overflow-auto w-full h-full">
        <div className="mb-2 border-b border-gray-300">
          <h3 className="text-lg font-semibold p-2 text-center">
            {inactiveLabel}
          </h3>
        </div>
        <div className="flex flex-col overflow-auto w-full h-full">
          {inactiveEntriesState.map((entry, index) => (
            <div
              key={index}
              className="p-2 flex hover:bg-base-discordia-lighter"
            >
              <div className="truncate">{entry}</div>
              <div className="ml-auto">
                <button
                  className="px-2 py-1 bg-green-500 text-white rounded"
                  onClick={handleSetActive.bind(null, entry)}
                >
                  &#43;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(StackPusher);
