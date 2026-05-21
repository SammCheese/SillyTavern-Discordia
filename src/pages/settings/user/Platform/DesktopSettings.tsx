import { memo } from 'react';
import Search from '../../../../components/common/search/search';
import type { UserSettingsCategory, UserSettingsItem } from '../Tabs/Settings';
import SettingsContent from '../Tabs/SettingsContent';

interface DesktopSettingsMenuProps {
  categories: UserSettingsCategory[];
  selectedItem?: UserSettingsItem;
  onSearchQueryChange: (query: string) => void;
  onSelectItem: (item: UserSettingsItem) => void;
}

const SectionHeader = memo(({ title }: { title: string }) => (
  <div className="font-gg-sans-bold text-sm mb-2 opacity-50">{title}</div>
));

const SettingItem = memo(
  ({
    label,
    description,
    icon,
    variant = 'default',
    isSelected,
    onClick,
  }: {
    label: string;
    description?: string;
    icon?: React.ReactNode | string;
    variant?: 'default' | 'danger';
    isSelected?: boolean;
    onClick?: () => void;
  }) => {
    const variantClasses = {
      default: 'text-white hover:bg-lighter',
      danger: 'text-red-500 hover:bg-red-600/20 hover:text-red-400',
    };

    return (
      <button
        type="button"
        className={`w-full text-left px-4 py-2 rounded-lg flex items-start space-x-2 cursor-pointer transition-colors text-sm opacity-70 hover:opacity-100
                ${variantClasses[variant]}
                ${isSelected ? 'bg-lighter opacity-100' : ''}`}
        onClick={onClick}
      >
        {icon && <div className="text-lg">{icon}</div>}
        <div className="min-w-0">
          <div
            className={`font-gg-sans-bold text-md ${variant === 'danger' ? 'text-red-400' : 'text-white'}`}
          >
            {label}
          </div>
          {description && (
            <div className="text-xs opacity-70 mt-0.5 truncate">
              {description}
            </div>
          )}
        </div>
      </button>
    );
  },
);

const DesktopSettingsMenu = ({
  categories,
  selectedItem,
  onSearchQueryChange,
  onSelectItem,
}: DesktopSettingsMenuProps) => {
  const hasResults = categories.some((category) => category.items.length > 0);

  const visibleCategories = categories.filter(
    (category) => category.items.length > 0,
  );

  const categoriesWithHandlers = visibleCategories.map((category) => {
    const visibleItems = category.items.filter(async (item) => {
      if (item.visibilityCondition) {
        return await item.visibilityCondition();
      }
      return true;
    });

    return {
      ...category,
      items: visibleItems.map((item) => ({
        ...item,
        onClick: () => onSelectItem(item),
      })),
    };
  });

  return (
    <div
      className="flex overflow-hidden"
      style={{
        height: 'calc(100vh - 120px)',
        backgroundColor:
          'var(--SmartThemeBlurTintColor, rgba(54, 57, 63, 0.8))',
      }}
    >
      <div className="w-64 h-full pr-6 border-r border-lighter shrink-0 flex flex-col">
        <div className="py-2 mb-4 w-full">
          <Search placeholder="Search Settings" onInput={onSearchQueryChange} />
        </div>
        <div className="flex-1 overflow-auto">
          {!hasResults && (
            <div className="px-4 text-xs opacity-60">
              No settings match your search.
            </div>
          )}
          {categoriesWithHandlers.map((category) => (
            <div
              key={category.id}
              className="mb-4 border-b border-lighter pb-4"
            >
              {category.title && <SectionHeader title={category.title} />}
              <div className="space-y-2">
                {category.items.map((item) => (
                  <SettingItem
                    key={item.id}
                    label={item.label}
                    description={item.description}
                    icon={item.icon}
                    variant={item.variant}
                    isSelected={selectedItem?.id === item.id}
                    onClick={() => onSelectItem(item)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full p-6 ">
        {!hasResults && (
          <div className="text-center opacity-50">
            <div className="text-2xl mb-2">No matches found</div>
            <div className="text-sm">Try another search term.</div>
          </div>
        )}
        {hasResults && !selectedItem && (
          <div className="text-center opacity-50">
            <div className="text-2xl mb-2">Select a setting to view</div>
          </div>
        )}
        {hasResults && selectedItem && <SettingsContent item={selectedItem} />}
      </div>
    </div>
  );
};

export default memo(DesktopSettingsMenu);
