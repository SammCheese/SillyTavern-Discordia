import { memo } from 'react';

const Divider = ({
  width = 'w-full',
  className = '',
}: {
  width?: string;
  className?: string;
}) => {
  return (
    <>
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
        className={`${width} h-px my-2 ml-auto mr-auto ${className}`}
      ></div>
    </>
  );
};

export default memo(Divider);
