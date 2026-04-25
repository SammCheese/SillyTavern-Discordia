import { lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { usePlatform } from '../../../providers/platformProvider';
import MobileSettings from './Platform/MobileSettings';
import {
  DEFAULT_USER_SETTING_ID,
  Settings,
  type UserSettingsCategory,
  type UserSettingsItem,
} from './Tabs/Settings';
import DesktopSettings from './Platform/DesktopSettings';

const SettingsFrame = lazy(() => import('../base/Base'));

const { saveSettingsDebounced } = await imports('@script');

const toSearchableString = (item: UserSettingsItem) => {
  return [item.label, item.description, ...(item.searchTerms ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

const filterCategories = (
  categories: UserSettingsCategory[],
  query: string,
): UserSettingsCategory[] => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return categories;
  }

  return categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        toSearchableString(item).includes(normalizedQuery),
      ),
    }))
    .filter((category) => category.items.length > 0);
};

const UserSettings = () => {
  const { isSmallScreen } = usePlatform();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSettingId, setSelectedSettingId] = useState<string | null>(
    DEFAULT_USER_SETTING_ID,
  );

  const filteredCategories = useMemo(
    () => filterCategories(Settings, searchQuery),
    [searchQuery],
  );

  const visibleItems = useMemo(
    () => filteredCategories.flatMap((category) => category.items),
    [filteredCategories],
  );

  const selectedItem = useMemo(() => {
    const activeItem = visibleItems.find(
      (item) => item.id === selectedSettingId && item.type !== 'action',
    );

    if (activeItem) {
      return activeItem;
    }

    return visibleItems.find((item) => item.type !== 'action');
  }, [visibleItems, selectedSettingId]);

  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch('/api/users/logout', { method: 'POST' });

      if (!response.ok && response.status !== 204) {
        console.error('Failed to log out. Status:', response.status);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error('Logout request failed:', error);
    }
  }, []);

  const handleSelectItem = useCallback(
    (item: UserSettingsItem) => {
      if (item.type === 'action') {
        if (item.id === 'logout') {
          void handleLogout();
        }
        return;
      }

      setSelectedSettingId(item.id);
    },
    [handleLogout],
  );

  useEffect(() => {
    return () => {
      saveSettingsDebounced();
    };
  }, []);

  return (
    <SettingsFrame title="User Settings" noPadding>
      <div className="settings-section">
        {isSmallScreen ? (
          <div>
            <MobileSettings
              categories={filteredCategories}
              selectedItem={selectedItem}
              onSearchQueryChange={setSearchQuery}
              onSelectItem={handleSelectItem}
            />
          </div>
        ) : (
          <div>
            <DesktopSettings
              categories={filteredCategories}
              selectedItem={selectedItem}
              onSearchQueryChange={setSearchQuery}
              onSelectItem={handleSelectItem}
            />
          </div>
        )}
      </div>
    </SettingsFrame>
  );
};

export default UserSettings;
