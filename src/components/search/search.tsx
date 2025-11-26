import React from "react";


const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = React.useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
  };

  return (
    <div id="search-bar-container"
      className="p-1 mx-2 flex content-center"
    >
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
}

export default SearchBar;
