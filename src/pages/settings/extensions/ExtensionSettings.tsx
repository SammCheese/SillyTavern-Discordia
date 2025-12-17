import { useCallback, lazy, memo, useState, useRef, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';

import { getManifests } from '../../../services/extensionService';

const Divider = lazy(
  () => import('../../../components/common/Divider/Divider'),
);
const Accordion = lazy(
  () => import('../../../components/common/Accordion/Accordion'),
);
const Toggle = lazy(() => import('../../../components/common/Switch/Switch'));
const SettingsFrame = lazy(() => import('../base/Base'));

const { extension_settings, enableExtension, disableExtension } = await imports(
  '@scripts/extensions',
);
const { saveSettingsDebounced } = await imports('@script');

interface ExtensionInfo {
  name: string;
  type: string;
  disabled: boolean;
}

async function discoverExtensions(): Promise<ExtensionInfo[]> {
  try {
    const response = await fetch('/api/extensions/discover');

    if (response.ok) {
      const extensions = await response.json();
      return extensions;
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
  }
}

interface ExtensionList {
  local: ExtensionInfo[];
  global: ExtensionInfo[];
  system: ExtensionInfo[];
}

interface ExtensionAccordionProps {
  extension: ExtensionInfo;
  onToggle: (ext: ExtensionInfo) => void;
}

const ExtensionAccordion: React.FC<ExtensionAccordionProps> = memo(
  function ExtensionAccordion({
    extension,
    onToggle,
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
        <div className="p-4 flex items-center justify-between">
          <label htmlFor={`${extension.name}-enabled`}> Enabled </label>
          <Toggle isOn={!extension.disabled} onToggle={handleToggle} />
        </div>
      </Accordion>
    );
  },
);

const ExtensionSettings = () => {
  const [extensions, setExtensions] = useState<ExtensionList>({
    local: [],
    global: [],
    system: [],
  });
  const [disabledExtensions, setDisabledExtensions] = useState<string[]>(
    extension_settings.disabledExtensions,
  );
  const initialDisabledRef = useRef<string[]>([
    ...extension_settings.disabledExtensions,
  ]);
  const currentDisabledRef = useRef<string[]>([
    ...extension_settings.disabledExtensions,
  ]);

  useEffect(() => {
    currentDisabledRef.current = disabledExtensions;
  }, [disabledExtensions]);

  useEffect(() => {
    discoverExtensions().then((exts) => {
      const categorized: ExtensionList = { local: [], global: [], system: [] };

      Object.values(exts)
        .flat()
        .forEach((ext) => {
          const bucketType =
            ext.type in categorized
              ? (ext.type as keyof ExtensionList)
              : 'local';

          categorized[bucketType].push({
            ...ext,
            type: bucketType,
            disabled: currentDisabledRef.current.includes(ext.name),
          });
        });

      setExtensions(categorized);
    });

    return () => {
      saveSettingsDebounced();

      const initial = [...initialDisabledRef.current].sort();
      const current = [...currentDisabledRef.current].sort();

      const hasChanged = JSON.stringify(initial) !== JSON.stringify(current);

      if (hasChanged) {
        window.location.reload();
      }
    };
  }, []);

  const onToggle = useCallback(async (extension: ExtensionInfo) => {
    const currentDisabled = currentDisabledRef.current;

    if (extension.disabled) {
      await enableExtension(extension.name, false);
      currentDisabledRef.current = currentDisabled.filter(
        (name) => name !== extension.name,
      );
    } else {
      await disableExtension(extension.name, false);
      currentDisabledRef.current = [...currentDisabled, extension.name];
    }

    setDisabledExtensions(currentDisabledRef.current);

    setExtensions((prev) => {
      const newExtensions = { ...prev };
      const type = extension.type as keyof ExtensionList;
      if (newExtensions[type]) {
        newExtensions[type] = newExtensions[type].map((e) =>
          e.name === extension.name ? { ...e, disabled: !e.disabled } : e,
        );
      }
      return newExtensions;
    });
  }, []);

  return (
    <SettingsFrame title="Extension Settings">
      <div
        className="settings-section overflow-auto"
        style={{ maxHeight: '80dvh' }}
      >
        <h3 className="text-2xl font-semibold mb-4">System Extensions</h3>
        <ul>
          {extensions.system.map((ext) => (
            <ExtensionAccordion
              key={ext.name}
              extension={ext}
              onToggle={onToggle}
            />
          ))}
        </ul>
        <Divider />
        <h3 className="text-2xl font-semibold mb-4">Global Extensions</h3>
        <ul>
          {extensions.global.map((ext) => (
            <ExtensionAccordion
              key={ext.name}
              extension={ext}
              onToggle={onToggle}
            />
          ))}
        </ul>
        <Divider />
        <h3 className="text-2xl font-semibold mb-4">Local Extensions</h3>
        <ul>
          {extensions.local.map((ext) => (
            <ExtensionAccordion
              key={ext.name}
              extension={ext}
              onToggle={onToggle}
            />
          ))}
        </ul>
      </div>
    </SettingsFrame>
  );
};

export default ExtensionSettings;
