import { memo, useCallback } from 'react';

const CHAR_BUTTON_ID = 'st-gallery-btn';

const CharacterLibraryButton = () => {
  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const charLibButton = document.getElementById(CHAR_BUTTON_ID);
    charLibButton?.click();
  }, []);

  return (
    <div
      className="discord-entity-item w-12 h-12 self-center content-center cursor-pointer border rounded-2xl border-base-discordia-lighter"
      id="char-lib-button"
      title="Character Library"
      onClick={handleClick}
    >
      <i className="fa fa-solid fa-robot text-[26px] "></i>
    </div>
  );
};

export default memo(CharacterLibraryButton);
