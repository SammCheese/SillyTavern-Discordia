import { memo } from 'react';

interface CardProps {
  children: React.ReactNode;
  color?: CardColor;
  className?: string;
  border?: CardBorder;
  background?: CardBackground;
}

export enum CardColor {
  DEFAULT = 'border-base-discordia-lighter',
  BLUE = 'border-blue-500',
  GREEN = 'border-green-500',
  RED = 'border-red-500',
  YELLOW = 'border-yellow-500',
}

export enum CardBackground {
  DEFAULT = 'bg-base-discordia',
  BLUE = 'bg-blue-500/10',
  GREEN = 'bg-green-500/10',
  RED = 'bg-red-500/10',
  YELLOW = 'bg-yellow-500/10',
}

export enum CardBorder {
  DEFAULT = 'solid',
  DOTTED = 'dotted',
  DASHED = 'dashed',
}

const Card = ({
  children,
  color = CardColor.DEFAULT,
  border = CardBorder.DEFAULT,
  background = CardBackground.DEFAULT,
  className,
}: CardProps) => {
  return (
    <div
      className={`p-4 text-wrap border border-${border} ${color} ${background} ${className}`}
    >
      {children}
    </div>
  );
};

export default memo(Card);
