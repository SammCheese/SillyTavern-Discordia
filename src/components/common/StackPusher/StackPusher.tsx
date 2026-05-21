import { memo, useCallback, useMemo, useState } from 'react';

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
  const isControlled =
    activeEntries !== undefined &&
    inactiveEntries !== undefined &&
    typeof onStackChange === 'function';

  const sanitizeStacks = useCallback(
    (active: string[] = [], inactive: string[] = []) => {
      const normalizedActive = [...new Set(active)];
      const activeSet = new Set(normalizedActive);
      const normalizedInactive = [...new Set(inactive)].filter(
        (entry) => !activeSet.has(entry),
      );

      return {
        active: normalizedActive,
        inactive: normalizedInactive,
      };
    },
    [],
  );

  const [entriesState, setEntriesState] = useState(() =>
    sanitizeStacks(activeEntries, inactiveEntries),
  );

  const controlledEntries = useMemo(
    () => sanitizeStacks(activeEntries, inactiveEntries),
    [activeEntries, inactiveEntries, sanitizeStacks],
  );

  const renderedActiveEntries = isControlled
    ? controlledEntries.active
    : entriesState.active;
  const renderedInactiveEntries = isControlled
    ? controlledEntries.inactive
    : entriesState.inactive;

  const handleStackChange = useCallback(
    (newActiveEntries: string[], newInactiveEntries: string[]) => {
      const sanitized = sanitizeStacks(newActiveEntries, newInactiveEntries);

      if (!isControlled) {
        setEntriesState(sanitized);
      }

      onStackChange?.(sanitized.active, sanitized.inactive);
    },
    [isControlled, onStackChange, sanitizeStacks],
  );

  const handleSetActive = useCallback(
    (entry: string) => {
      const newActive = [
        ...renderedActiveEntries.filter((e) => e !== entry),
        entry,
      ];
      const newInactive = renderedInactiveEntries.filter((e) => e !== entry);
      handleStackChange(newActive, newInactive);
    },
    [renderedActiveEntries, renderedInactiveEntries, handleStackChange],
  );

  const handleSetInactive = useCallback(
    (entry: string) => {
      const newInactive = [
        ...renderedInactiveEntries.filter((e) => e !== entry),
        entry,
      ];
      const newActive = renderedActiveEntries.filter((e) => e !== entry);
      handleStackChange(newActive, newInactive);
    },
    [renderedActiveEntries, renderedInactiveEntries, handleStackChange],
  );

  return (
    <div className="flex flex-row w-full h-96 rounded overflow-hidden flex-nowrap border border-lighter">
      <div className="flex flex-col overflow-auto w-full h-full border-r border-lighter">
        <div className="mb-2 border-b border-gray-300">
          <h3 className="text-lg font-semibold p-2 text-center">
            {activeLabel}
          </h3>
        </div>
        <div className="flex flex-col overflow-auto w-full h-full">
          {renderedActiveEntries.map((entry) => (
            <div
              key={entry}
              className="p-2 flex hover:bg-base-discordia-lighter"
            >
              <div className="truncate content-center">{entry}</div>
              <div className="ml-auto">
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded cursor-pointer"
                  onClick={() => handleSetInactive(entry)}
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
          {renderedInactiveEntries.map((entry) => (
            <div
              key={entry}
              className="p-2 flex hover:bg-base-discordia-lighter"
            >
              <div className="truncate content-center">{entry}</div>
              <div className="ml-auto">
                <button
                  className="px-2 py-1 bg-green-500 text-white rounded cursor-pointer"
                  onClick={() => handleSetActive(entry)}
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
