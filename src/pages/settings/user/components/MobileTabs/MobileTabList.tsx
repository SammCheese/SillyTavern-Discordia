import { memo } from 'react';
import { type MobileTabItem } from './MobileTab';
import MobileTab from './MobileTab';

const MobileTabList = ({ items }: { items: MobileTabItem[] }) => {
  const groupedItems = items.reduce<MobileTabItem[][]>(
    (acc, item) => {
      if (item.variant === 'separator') {
        const lastGroup = acc[acc.length - 1];
        if (lastGroup && lastGroup.length > 0) {
          acc.push([]);
        }
      } else {
        const lastGroup = acc[acc.length - 1];
        if (lastGroup) {
          lastGroup.push(item);
        }
      }
      return acc;
    },
    [[]],
  );

  return (
    <div role="menu" className="flex flex-col">
      {groupedItems.map((group, groupIndex) => {
        if (group.length === 0) {
          return null;
        }

        return (
          <div
            key={group[0]?.id || group[0]?.label || groupIndex}
            className={'mb-3 last:mb-0 shadow-sm'}
          >
            {group.map((item, itemIndex) => (
              <MobileTab
                key={item.id || item.label || itemIndex}
                isFirst={itemIndex === 0}
                isLast={itemIndex === group.length - 1}
                {...item}
              />
            ))}
            {groupIndex < groupedItems.length - 1 && <div className="my-1" />}
          </div>
        );
      })}
    </div>
  );
};

export default memo(MobileTabList);
