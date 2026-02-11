import { useCallback, lazy, useMemo, useRef, Suspense } from 'react';

import type { Manifest } from '../../../services/extensionService';
import { useExtensionState } from '../../../providers/extensionProvider';
import { usePopup } from '../../../providers/popupProvider';
import ExtensionSection from './components/ExtensionSection';
import PendingChangesBanner from './components/PendingChanges';

const SettingsFrame = lazy(() => import('../base/Base'));

const { saveSettingsDebounced } = await imports('@script');
const { deleteExtension } = await imports('@scripts/extensions');

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

const ExtensionSettings = () => {
  const { toggleExtension, categorizedExtensions, disabledExtensions } =
    useExtensionState();
  const { openPopup } = usePopup();

  const initialDisabledStateRef = useRef<Set<string>>(
    new Set(disabledExtensions),
  );

  const onToggle = useCallback(
    (extension: ExtensionInfo) => {
      toggleExtension(extension);
    },
    [toggleExtension],
  );

  const handleClose = useCallback(() => {
    saveSettingsDebounced();
  }, []);

  const handleDelete = useCallback(
    (extension: ExtensionInfo) => {
      const extensionName = extension.name.replace('third-party/', '');
      openPopup(null, {
        title: 'Confirm Deletion',
        confirmText: 'Delete',
        confirmVariant: 'danger',
        cancelText: 'Cancel',
        description: `Are you sure you want to delete the extension "${extensionName}"? This action cannot be undone.`,
        onConfirm: () => {
          return deleteExtension(extensionName);
        },
      });
    },
    [openPopup],
  );

  const sections = useMemo(
    () => [
      { title: 'System Extensions', extensions: categorizedExtensions.system },
      { title: 'Global Extensions', extensions: categorizedExtensions.global },
      { title: 'Local Extensions', extensions: categorizedExtensions.local },
    ],
    [categorizedExtensions],
  );

  const hasPendingChanges = useMemo(() => {
    // eslint-disable-next-line react-hooks/refs
    if (disabledExtensions.length !== initialDisabledStateRef.current.size)
      return true;

    for (const ext of disabledExtensions) {
      // eslint-disable-next-line react-hooks/refs
      if (!initialDisabledStateRef.current.has(ext)) return true;
    }
    return false;
  }, [disabledExtensions, initialDisabledStateRef]);

  const reloadWindow = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <SettingsFrame
          title="Extension Settings"
          onClose={handleClose}
          header={
            hasPendingChanges ? (
              <PendingChangesBanner onReload={reloadWindow} />
            ) : null
          }
        >
          <div className="settings-section space-y-6">
            <div>
              {sections &&
                sections.map(
                  ({ title, extensions }) =>
                    extensions.length > 0 && (
                      <ExtensionSection
                        key={title}
                        title={title}
                        extensions={extensions}
                        onToggle={onToggle}
                        onDelete={handleDelete}
                      />
                    ),
                )}
            </div>
          </div>
        </SettingsFrame>
      </Suspense>
    </>
  );
};

export default ExtensionSettings;
