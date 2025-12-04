import React from 'react';

const Input = React.lazy(() => import('../Input/Input'));

interface SearchBarProps {
  onInput: (query: string) => void;
  style?: React.CSSProperties;
  onIconClick?: () => void;
}

const SearchBar = ({ onInput, style, onIconClick }: SearchBarProps) => {
  const [query, setQuery] = React.useState('');

  const handleInputChange = React.useCallback(
    (e: string) => {
      setQuery(e);
      onInput(e);
    },
    [onInput],
  );

  const handleIconClick = React.useCallback(() => {
    if (onIconClick) {
      onIconClick();
    }
  }, [onIconClick]);

  return (
    <div
      id="search-bar-container"
      className=" relative p-1 mx-2 flex content-center gap-2 bg-input-bg rounded-md items-baseline flex-row"
      style={style}
    >
      <Input placeholder="Search" value={query} onChange={handleInputChange} />
      <div
        className="fa-solid fa-magnifying-glass content-center cursor-pointer w-5 h-5 hover:opacity-100 opacity-70 absolute right-3 top-1/2 transform -translate-y-1/2"
        onClick={handleIconClick}
      ></div>
    </div>
  );
};

export default React.memo(SearchBar);
