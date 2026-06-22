import { memo, useLayoutEffect, useRef } from 'react';
import { relocate } from '../../../../patches/settingsHijack';

interface SettingsHostProps {
  settings?: JQuery<HTMLElement> | null | undefined;
  disabled?: boolean;
}

const SettingsHost = ({ settings, disabled }: SettingsHostProps) => {
  const hostRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const node = settings?.[0];
    if (!host || !node || disabled) return;

    const origin = node.parentElement;
    const anchor = origin
      ? document.createComment('settings-host-anchor')
      : null;
    if (origin && anchor) origin.insertBefore(anchor, node);

    relocate(() => host.appendChild(node));

    return () => {
      relocate(() => {
        if (anchor?.parentNode) anchor.parentNode.replaceChild(node, anchor);
        else if (node.parentNode === host) host.removeChild(node);
      });
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
