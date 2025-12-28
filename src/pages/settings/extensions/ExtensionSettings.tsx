import {
  useCallback,
  lazy,
  memo,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from 'react';
import Skeleton from 'react-loading-skeleton';

import { getManifests } from '../../../services/extensionService';

import { useExtensionState } from './hooks/useExtensionState';
import ErrorBoundary from '../../../components/common/ErrorBoundary/ErrorBoundary';

const Divider = lazy(
  () => import('../../../components/common/Divider/Divider'),
);
const Accordion = lazy(
  () => import('../../../components/common/Accordion/Accordion'),
);
const Toggle = lazy(() => import('../../../components/common/Switch/Switch'));
const SettingsFrame = lazy(() => import('../base/Base'));

const { saveSettingsDebounced } = await imports('@script');

export interface ExtensionInfo {
  name: string;
  type: string;
  disabled: boolean;
  settings?: JQuery<HTMLElement> | null | undefined;
}

export interface ExtensionList {
  local: ExtensionInfo[];
  global: ExtensionInfo[];
  system: ExtensionInfo[];
}

interface ExtensionAccordionProps {
  extension: ExtensionInfo;
  onToggle: (ext: ExtensionInfo) => void;
  settings?: JQuery<HTMLElement> | null | undefined;
}

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

const ExtensionAccordion: React.FC<ExtensionAccordionProps> = memo(
  function ExtensionAccordion({
    extension,
    onToggle,
    settings,
  }: ExtensionAccordionProps) {
    const [displayName, setDisplayName] = useState(extension.name);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let isMounted = true;

      getManifests([extension.name]).then((manifests) => {
        if (isMounted) {
          setDisplayName(
            manifests[extension.name]?.display_name || extension.name,
          );
          setLoading(false);
        }
      });
      return () => {
        isMounted = false;
      };
    }, []);

    const handleToggle = useCallback(() => {
      onToggle(extension);
    }, [onToggle, extension]);

    if (loading) {
      return (
        <Accordion title={<Skeleton width={150} />}>
          <div className="p-4 flex items-center justify-between">
            <label>
              <Skeleton width={60} />
            </label>
            <Skeleton width={40} height={20} />
          </div>
        </Accordion>
      );
    }

    return (
      <Accordion title={displayName}>
        <ErrorBoundary>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 justify-between">
              <label htmlFor={`${extension.name}-enabled`}> Enabled </label>
              <Toggle isOn={!extension.disabled} onToggle={handleToggle} />
            </div>
            <Divider />
            <SettingsHost settings={settings} disabled={extension.disabled} />
          </div>
        </ErrorBoundary>
      </Accordion>
    );
  },
);

const ExtensionSettings = () => {
  const state = useExtensionState();

  const onToggle = useCallback(
    async (extension: ExtensionInfo) => {
      await state.toggleExtension(extension);
    },
    [state.toggleExtension],
  );

  const handleClose = useCallback(() => {
    saveSettingsDebounced();
  }, []);

  return (
    <SettingsFrame title="Extension Settings" onClose={handleClose}>
      <div className="settings-section space-y-6">
        {state.categorizedExtensions.system.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">System Extensions</h3>
            <div className="space-y-2">
              {state.categorizedExtensions.system.map((ext) => (
                <ExtensionAccordion
                  key={ext.name}
                  extension={ext}
                  onToggle={onToggle}
                  settings={ext.settings}
                />
              ))}
            </div>
          </div>
        )}
        {state.categorizedExtensions.global.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Global Extensions</h3>
            <div className="space-y-2">
              {state.categorizedExtensions.global.map((ext) => (
                <ExtensionAccordion
                  key={ext.name}
                  extension={ext}
                  onToggle={onToggle}
                  settings={ext.settings}
                />
              ))}
            </div>
          </div>
        )}
        {state.categorizedExtensions.local.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Local Extensions</h3>
            <div className="space-y-2">
              {state.categorizedExtensions.local.map((ext) => (
                <ExtensionAccordion
                  key={ext.name}
                  extension={ext}
                  onToggle={onToggle}
                  settings={ext.settings}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </SettingsFrame>
  );
};

export default ExtensionSettings;
