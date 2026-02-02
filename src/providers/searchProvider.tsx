import type _ from 'lodash';
import { createContext, useState, use, type ReactNode, useMemo } from 'react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(
  undefined,
);

const lodash = SillyTavern.libs.lodash as typeof _;

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSet = useMemo(() => lodash.debounce(setSearchQuery, 300), []);

  return (
    <SearchContext value={{ searchQuery, setSearchQuery: debouncedSet }}>
      {children}
    </SearchContext>
  );
};

export const useSearch = () => {
  const context = use(SearchContext);
  if (!context) {
    throw new Error('useSearch cannot be used outside of SearchProvider');
  }
  return context;
};
