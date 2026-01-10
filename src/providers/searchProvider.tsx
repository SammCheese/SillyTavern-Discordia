import type _ from 'lodash';
import {
  createContext,
  useState,
  useCallback,
  useContext,
  type ReactNode,
} from 'react';

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

  const handleSetSearchQuery = useCallback((query: string) => {
    lodash.debounce(() => {
      setSearchQuery(query);
    }, 300)();
  }, []);

  return (
    <SearchContext.Provider
      value={{ searchQuery, setSearchQuery: handleSetSearchQuery }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch cannot be used outside of SearchProvider');
  }
  return context;
};
