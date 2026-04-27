import { memo, useCallback, useMemo, useState } from 'react';
import MobileTabList from '../components/MobileTabs/MobileTabList';
import Search from '../../../../components/common/search/search';
import { useBackHandler } from '../../../../hooks/useBackHandler';
import type { UserSettingsCategory, UserSettingsItem } from '../Tabs/Settings';
import SettingsContent from '../Tabs/SettingsContent';

interface MobileSettingsMenuProps {
  categories: UserSettingsCategory[];
  selectedItem?: UserSettingsItem;
  onSearchQueryChange: (query: string) => void;
  onSelectItem: (item: UserSettingsItem) => void;
}

const MobileSettingsMenu = ({
  categories,
  selectedItem,
  onSearchQueryChange,
  onSelectItem,
}: MobileSettingsMenuProps) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  useBackHandler(isPanelOpen, closePanel, 120);

  const handleSelectItem = useCallback(
    (item: UserSettingsItem) => {
      onSelectItem(item);

      if ((item.type ?? 'view') === 'view') {
        setIsPanelOpen(true);
      }
    },
    [onSelectItem],
  );

  const categoriesWithHandlers = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        items: category.items.map((item) => ({
          ...item,
          onClick: () => handleSelectItem(item),
        })),
      })),
    [categories, handleSelectItem],
  );

  const hasResults = categoriesWithHandlers.some(
    (category) => category.items.length > 0,
  );

  return (
    <div className="mobile-settings-menu relative overflow-hidden min-h-105">
      <div
        className={`transition-all duration-200 ease-out ${
          isPanelOpen
            ? 'opacity-0 -translate-x-2 pointer-events-none'
            : 'opacity-100 translate-x-0'
        }`}
      >
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

      <div
        className={`absolute inset-0 transition-all duration-200 ease-out ${
          isPanelOpen
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 translate-x-4 pointer-events-none'
        }`}
      >
        <div className="bg-base-discordia h-full">
          <button
            type="button"
            className="mb-4 inline-flex items-center gap-2 px-1 py-1 text-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={closePanel}
          >
            <span className="text-base">&lt;</span>
            Back to Settings
          </button>

          {selectedItem ? (
            <SettingsContent item={selectedItem} />
          ) : (
            <div className="text-sm opacity-60">Select a setting to view.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(MobileSettingsMenu);
