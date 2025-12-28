import { useCallback, lazy, useMemo } from 'react';

import { useExtensionState } from './hooks/useExtensionState';
import ExtensionAccordion from './components/ExtensionAccordion';
import type { Manifest } from '../../../services/extensionService';

const SettingsFrame = lazy(() => import('../base/Base'));

const { saveSettingsDebounced } = await imports('@script');

export type Version = {
  isUpToDate: boolean;
  currentBranchName: string;
  currentCommitHash: string;
  remoteUrl: string;
};

export interface ExtensionInfo {
  name: string;
  type: string;
  disabled: boolean;
  manifest?: Manifest | undefined;
  settings?: JQuery<HTMLElement> | null | undefined;
  version?: Version | undefined;
}

export interface ExtensionList {
  local: ExtensionInfo[];
  global: ExtensionInfo[];
  system: ExtensionInfo[];
}

interface ExtensionSectionProps {
  title: string;
  extensions: ExtensionInfo[];
  onToggle: (ext: ExtensionInfo) => void;
}

const ExtensionSection = ({
  title,
  extensions,
  onToggle,
}: ExtensionSectionProps) => {
  if (extensions.length === 0) return null;

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {extensions.map((ext) => (
          <ExtensionAccordion
            key={ext.name}
            extension={ext}
            onToggle={onToggle}
            {...ext}
          />
        ))}
      </div>
    </div>
  );
};

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

  const sections = useMemo(
    () => [
      { title: 'System Extensions', extensions: categorizedExtensions.system },
      { title: 'Global Extensions', extensions: categorizedExtensions.global },
      { title: 'Local Extensions', extensions: categorizedExtensions.local },
    ],
    [categorizedExtensions],
  );

  return (
    <SettingsFrame title="Extension Settings" onClose={handleClose}>
      <div className="settings-section space-y-6">
        {sections.map(
          ({ title, extensions }) =>
            extensions.length > 0 && (
              <ExtensionSection
                key={title}
                title={title}
                extensions={extensions}
                onToggle={onToggle}
              />
            ),
        )}
      </div>
    </SettingsFrame>
  );
};

export default ExtensionSettings;
