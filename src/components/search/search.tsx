import React from 'react';

interface SearchBarProps {
  onInput: (query: string) => void;
}

const SearchBar = ({ onInput }: SearchBarProps) => {
  const [query, setQuery] = React.useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onInput(newQuery);
  };

  return (
    <div id="search-bar-container" className="p-1 mx-2 flex content-center">
      <div></div>
      <input
        type="text"
        id="search-input"
        placeholder="Search..."
        className="p-1 rounded-lg w-full pl-4"
        value={query}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default React.memo(SearchBar);
