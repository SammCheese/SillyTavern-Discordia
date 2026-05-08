import {
  createContext,
  useContext,
  type ReactNode,
  type CSSProperties,
  Fragment,
} from 'react';

interface SkeletonThemeValues {
  baseColor?: string;
  highlightColor?: string;
  duration?: number;
  borderRadius?: string | number;
  height?: string | number;
  width?: string | number;
  enableAnimation?: boolean;
}

const SkeletonThemeContext = createContext<SkeletonThemeValues>({});

export interface SkeletonThemeProps extends SkeletonThemeValues {
  children: ReactNode;
}

export const SkeletonTheme = ({
  children,
  baseColor,
  highlightColor,
  duration,
  borderRadius,
  height,
  width,
  enableAnimation,
}: SkeletonThemeProps) => {
  return (
    <SkeletonThemeContext.Provider
      value={{
        baseColor,
        highlightColor,
        duration,
        borderRadius,
        height,
        width,
        enableAnimation,
      }}
    >
      {children}
    </SkeletonThemeContext.Provider>
  );
};

export interface SkeletonProps extends SkeletonThemeValues {
  className?: string;
  containerClassName?: string;
  count?: number;
}

const toCssValue = (value?: string | number) =>
  typeof value === 'number' ? `${value}px` : value;

const Skeleton = ({
  className,
  containerClassName,
  count = 1,
  baseColor,
  highlightColor,
  duration,
  borderRadius,
  height,
  width,
  enableAnimation,
}: SkeletonProps) => {
  const theme = useContext(SkeletonThemeContext);
  const resolvedBase = baseColor ?? theme.baseColor;
  const resolvedHighlight = highlightColor ?? theme.highlightColor;
  const resolvedDuration = duration ?? theme.duration;
  const resolvedRadius = borderRadius ?? theme.borderRadius;
  const resolvedHeight = height ?? theme.height;
  const resolvedWidth = width ?? theme.width;
  const resolvedAnimation = enableAnimation ?? theme.enableAnimation ?? true;

  const skeletonStyle: CSSProperties = {
    borderRadius: toCssValue(resolvedRadius),
    height: toCssValue(resolvedHeight),
    width: toCssValue(resolvedWidth),
    ['--skeleton-base' as string]: resolvedBase,
    ['--skeleton-highlight' as string]: resolvedHighlight,
    ['--skeleton-duration' as string]:
      resolvedDuration !== undefined ? `${resolvedDuration}s` : undefined,
  };

  const skeletonClassName = [
    'discordia-skeleton',
    resolvedAnimation
      ? 'discordia-skeleton--animate'
      : 'discordia-skeleton--static',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Fragment key={index}>
          <span
            className={['discordia-skeleton__container', containerClassName]
              .filter(Boolean)
              .join(' ')}
          >
            <span className={skeletonClassName} style={skeletonStyle} />
          </span>
        </Fragment>
      ))}
    </>
  );
};

export default Skeleton;
