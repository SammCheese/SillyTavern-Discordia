import { memo, useLayoutEffect, useRef } from 'react';

const SettingsHost = ({
  settings,
  disabled,
}: {
  settings?: JQuery<HTMLElement> | null | undefined;
  disabled?: boolean;
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const attachedNodeRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (
      attachedNodeRef.current &&
      attachedNodeRef.current.parentElement === host
    ) {
      host.removeChild(attachedNodeRef.current);
      attachedNodeRef.current = null;
    }

    if (!settings || settings.length === 0 || disabled) {
      host.innerHTML = '';
      return;
    }

    const $clone = settings.clone(true);
    const node = $clone.get(0);
    if (!node) return;

    host.innerHTML = '';
    host.appendChild(node);
    attachedNodeRef.current = node;

    return () => {
      if (
        attachedNodeRef.current &&
        attachedNodeRef.current.parentElement === host
      ) {
        host.removeChild(attachedNodeRef.current);
        attachedNodeRef.current = null;
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
