import { useCallback, lazy } from 'react';

import { useExtensionState } from './hooks/useExtensionState';
import ExtensionAccordion from './components/ExtensionAccordion';

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

const ExtensionSettings = () => {
  const { toggleExtension, categorizedExtensions } = useExtensionState();

  const onToggle = useCallback(
    async (extension: ExtensionInfo) => {
      await toggleExtension(extension);
    },
    [toggleExtension],
  );

  const handleClose = useCallback(() => {
    saveSettingsDebounced();
  }, []);

  return (
    <SettingsFrame title="Extension Settings" onClose={handleClose}>
      <div className="settings-section space-y-6">
        {categorizedExtensions.system.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">System Extensions</h3>
            <div className="space-y-2">
              {categorizedExtensions.system.map((ext) => (
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
        {categorizedExtensions.global.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Global Extensions</h3>
            <div className="space-y-2">
              {categorizedExtensions.global.map((ext) => (
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
        {categorizedExtensions.local.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Local Extensions</h3>
            <div className="space-y-2">
              {categorizedExtensions.local.map((ext) => (
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
