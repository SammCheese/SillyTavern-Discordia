import {
  createContext,
  useState,
  use,
  type ReactNode,
  useMemo,
  useEffect,
} from 'react';

interface PlatformContextType {
  isMobile: boolean;
  isSmallScreen: boolean;
  screenWidth: number;
  screenHeight: number;
}

export const PlatformContext = createContext<PlatformContextType | undefined>(
  undefined,
);

const _ = SillyTavern.libs.lodash;

export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const [platformInfo, setPlatformInfo] = useState<PlatformContextType>({
    isMobile:
      /Mobi|Android/i.test(navigator.userAgent) ||
      navigator.platform.includes('Mobile') ||
      navigator.maxTouchPoints > 1,
    isSmallScreen: window.innerWidth < 768,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setPlatformInfo((prev) => ({
        ...prev,
        isSmallScreen: window.innerWidth < 768,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      }));
    };

    const debouncedHandleResize = _.debounce(handleResize, 200);

    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, []);

  const contextValue = useMemo(() => platformInfo, [platformInfo]);

  return <PlatformContext value={contextValue}>{children}</PlatformContext>;
};

export const usePlatform = () => {
  const context = use(PlatformContext);
  if (!context) {
    throw new Error('usePlatform cannot be used outside of PlatformProvider');
  }
  return context;
};

export default PlatformProvider;
