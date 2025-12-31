import { memo, useLayoutEffect, useRef } from 'react';

interface SettingsHostProps {
  settings?: JQuery<HTMLElement> | null | undefined;
  disabled?: boolean;
}

const SettingsHost = ({ settings, disabled }: SettingsHostProps) => {
  const hostRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (!settings || settings.length === 0 || disabled) {
      host.innerHTML = '';
      return;
    }

    const node = settings[0];
    if (!node) return;

    if (node.parentElement !== host) {
      host.innerHTML = '';
      host.appendChild(node);
    }

    return () => {
      if (host.contains(node)) {
        host.removeChild(node);
      }
    };
  }, [settings, disabled]);

  if (!settings || disabled) {
    return (
      <div className="text-gray-500 text-center py-2">
        {disabled ? 'Extension Disabled' : 'No Settings Available'}
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      className="settings-container overflow-auto max-h-96 overflow-x-hidden"
    />
  );
};

export default memo(SettingsHost);
