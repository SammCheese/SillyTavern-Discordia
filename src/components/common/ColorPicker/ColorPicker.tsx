import React, { memo, useCallback, useRef, useState } from 'react';
import { RgbaStringColorPicker } from 'react-colorful';

import useClickOutside from './hooks/useClickOutside';

const PopoverColorPicker = ({ color, onChangeEnd }) => {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(containerRef, close);

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="w-8 h-8 rounded cursor-pointer border border-gray-300"
        style={{ backgroundColor: color }}
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <RgbaStringColorPicker color={color} onChangeEnd={onChangeEnd} />
        </div>
      )}
    </div>
  );
};

export default memo(PopoverColorPicker);
