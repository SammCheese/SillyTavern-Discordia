import type { ReactNode } from 'react';

export type UserSettingsItemType = 'view' | 'action';
export type UserSettingsItemVariant = 'default' | 'danger';

export interface UserSettingsItem {
  id: string;
  label: string;
  description?: string;
  variant?: UserSettingsItemVariant;
  hasSubMenu?: boolean;
  icon?: ReactNode | string;
  searchTerms?: string[];
  type?: UserSettingsItemType;
}

export interface UserSettingsCategory {
  id: string;
  title: string;
  items: UserSettingsItem[];
}

export const DEFAULT_USER_SETTING_ID = 'account';

export const Settings: UserSettingsCategory[] = [
  {
    id: 'account-settings',
    title: 'Account Settings',
    items: [
      {
        id: 'account',
        label: 'Account',
        description: 'Manage your account settings.',
        searchTerms: ['profile', 'user'],
      },
      {
        id: 'admin-panel',
        label: 'Admin Panel',
        description: 'Access administrative tools and settings.',
        searchTerms: ['admin', 'moderation', 'permissions'],
      },
    ],
  },
  {
    id: 'appearance-and-behavior',
    title: 'Appearance & Behavior',
    items: [
      {
        id: 'theme',
        label: 'Theme',
        description: 'Choose between light and dark mode.',
        searchTerms: ['color', 'dark mode', 'light mode'],
      },
      {
        id: 'ui-behavior',
        label: 'UI Behavior',
        description:
          'Customize how the UI behaves, including animations and interactions.',
        searchTerms: ['animation', 'motion', 'interaction'],
      },
      {
        id: 'message-display',
        label: 'Message Display',
        description:
          'Adjust how messages are displayed, including font size and spacing.',
        searchTerms: ['font', 'spacing', 'chat'],
      },
      {
        id: 'advanced-appearance',
        label: 'Advanced Appearance',
        description:
          'Fine-tune the appearance of the app with advanced settings.',
        searchTerms: ['advanced', 'styles', 'css'],
      },
    ],
  },
  {
    id: 'session-actions',
    title: '',
    items: [
      {
        id: 'logout',
        label: 'Logout',
        variant: 'danger',
        hasSubMenu: false,
        type: 'action',
        description: 'Sign out from the current account.',
        searchTerms: ['sign out', 'session'],
      },
    ],
  },
];
