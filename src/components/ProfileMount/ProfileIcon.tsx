import { memo, useCallback, useMemo } from 'react';

interface ProfileIconProps {
  icon: Icon;
  onClick: (icon: Icon) => void;
  apiConnected?: boolean;
  enabled?: boolean;
}

const ProfileIcon = ({
  icon,
  onClick,
  apiConnected = false,
  enabled = true,
}: ProfileIconProps) => {
  // connection thing is a special cookie
  const isPlugIcon = useMemo(
    () => icon.className.includes('fa-plug'),
    [icon.className],
  );
  const connectedClasses = useMemo(
    () =>
      apiConnected
        ? icon.className
            .replace('redOverlayGlow', '')
            .replace('fa-plug-circle-exclamation', 'fa-plug')
        : `${icon.className}`,
    [apiConnected, icon.className],
  );

  const overrides = useMemo(
    () => [
      {
        id: '#user-settings-button',
        className: 'drawer-icon fa-solid fa-gear fa interactable closedIcon',
      },
    ],
    [],
  );

  const overriddenClassName = useMemo(() => {
    const override = overrides.find((o) => o.id === icon.id);
    return override ? override.className : icon.className;
  }, [icon.className, icon.id, overrides]);

  const handleClick = useCallback(() => {
    if (onClick && enabled) {
      onClick(icon);
    }
  }, [onClick, enabled, icon]);

  if (isPlugIcon) {
    return (
      <div
        className={connectedClasses}
        title={icon.title}
        onClick={handleClick}
      />
    );
  } else {
    return (
      <div
        className={overriddenClassName}
        title={icon.title}
        onClick={handleClick}
      />
    );
  }
};

export default memo(ProfileIcon);
