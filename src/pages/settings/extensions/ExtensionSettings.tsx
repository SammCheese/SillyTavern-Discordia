import React from 'react';

const Divider = React.lazy(() => import('../../../components/Divider/Divider'));
const Accordion = React.lazy(() => import('../../../components/common/Accordion/Accordion'));
const Toggle = React.lazy(() => import('../../../components/common/Toggle/Toggle'));
const SettingsFrame = React.lazy(() => import('../base/Base'));

const { extension_settings, enableExtension, disableExtension  } = await imports('@scripts/extensions');
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

const ExtensionAccordion: React.FC<{ extension: ExtensionInfo, enabled: boolean }> = ({ extension, enabled }) => {

  return (
    <Accordion
      title={`${extension.name}`}
      isOpen={false}
      onToggle={() => {}}
    >
      <div className="p-4 flex items-center justify-between">
        <label htmlFor={`${extension.name}-enabled`}> Enabled </label>
        <Toggle isOn={!extension.disabled} handleToggle={() => {
          if (extension.disabled) {
            enableExtension(extension.name);
          } else {
            disableExtension(extension.name);
          }
        }} />
      </div>
    </Accordion>
  );
};


const ExtensionSettings = () => {
  const [extensions, setExtensions] = React.useState<ExtensionList>({ local: [], global: [], system: [] });

  React.useEffect(() => {
    const disabledExtensions: string[] = extension_settings.disabledExtensions;
    discoverExtensions().then((exts) => {
      const categorized: ExtensionList = { local: [], global: [], system: [] };
      exts.forEach((ext) => {
        if (ext.type === 'local') {
          categorized.local.push({...ext, disabled: disabledExtensions.includes(ext.name)});
        } else if (ext.type === 'global') {
          categorized.global.push({...ext, disabled: disabledExtensions.includes(ext.name)});
        } else if (ext.type === 'system') {
          categorized.system.push({...ext, disabled: disabledExtensions.includes(ext.name)});
        }
      });
      setExtensions(categorized);
    });

    return () => {
      console.log('Extension Settings Unloaded, saving settings.');
      saveSettingsDebounced();
    };
  }, [extension_settings]);


  return (
    <SettingsFrame title="Extension Settings">
      <div
        className="settings-section overflow-auto"
        style={{ maxHeight: '70dvh' }}
      >
        <h3 className="text-2xl font-semibold mb-4">System Extensions</h3>
        <ul>
          {extensions.system.map((ext) => (
            <ExtensionAccordion
              key={ext.name}
              extension={ext}
              enabled={false}
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
              enabled={false}
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
              enabled={false}
            />
          ))}
        </ul>
      </div>
    </SettingsFrame>
  );
};

export default ExtensionSettings;
