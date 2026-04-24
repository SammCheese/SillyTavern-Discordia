import { memo, useMemo } from 'react';
import MobileTabList from '../components/MobileTabs/MobileTabList';
import Search from '../../../../components/common/search/search';
import type { UserSettingsCategory, UserSettingsItem } from '../Tabs/Settings';

interface MobileSettingsMenuProps {
  categories: UserSettingsCategory[];
  onSearchQueryChange: (query: string) => void;
  onSelectItem: (item: UserSettingsItem) => void;
}

const MobileSettingsMenu = ({
  categories,
  onSearchQueryChange,
  onSelectItem,
}: MobileSettingsMenuProps) => {
  const categoriesWithHandlers = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        items: category.items.map((item) => ({
          ...item,
          onClick: () => onSelectItem(item),
        })),
      })),
    [categories, onSelectItem],
  );

  const hasResults = categoriesWithHandlers.some(
    (category) => category.items.length > 0,
  );

  return (
    <div className="mobile-settings-menu">
      <div className="py-3 mb-4 w-full">
        <Search placeholder="Search Settings" onInput={onSearchQueryChange} />
      </div>
      <div>
        {!hasResults && (
          <div className="text-sm opacity-60 px-2">
            No settings match your search.
          </div>
        )}
        {categoriesWithHandlers.map((category) => (
          <div key={category.id} className="mb-4">
            {category.title && (
              <div className="font-gg-sans-bold text-md mb-2 opacity-80">
                {category.title}
              </div>
            )}
            <div>
              <MobileTabList key={category.id} items={category.items} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(MobileSettingsMenu);
