import { memo } from 'react';

interface DividerProps {
  width?: string;
  className?: string;
}

const Divider = ({ width = 'w-full', className = '' }: DividerProps) => {
  return (
    <>
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
        className={`${width} h-px my-2 mx-auto ${className}`}
      ></div>
    </>
  );
};

export default memo(Divider);
