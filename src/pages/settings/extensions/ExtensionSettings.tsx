import {
  useCallback,
  lazy,
  useMemo,
  useRef,
  Suspense,
  memo,
  useState,
} from 'react';

import type { Manifest } from '../../../services/extensionService';
import { useExtensionState } from '../../../providers/contentProviders/extensionProvider';
import { usePopup } from '../../../providers/popupProvider';
import ExtensionSection from './components/ExtensionSection';
import PendingChangesBanner from './components/PendingChanges';
import IconButton from '../../../components/common/IconButton/IconButton';
import InstallPopup from './components/popups/InstallPopup';
import { useBackHandlerBypass } from '../../../hooks/useBackHandler';

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
  const {
    toggleExtension,
    categorizedExtensions,
    disabledExtensions,
    updatedExtensions,
    refreshExtensions,
  } = useExtensionState();
  const { bypassAndReload } = useBackHandlerBypass();
  const { openPopup } = usePopup();

  const initialDisabledStateRef = useRef<Set<string>>(
    new Set(disabledExtensions),
  );
  const [shouldForceBanner, setShouldForceBanner] = useState(false);

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
        onConfirm: async () => {
          setShouldForceBanner(true);
          await deleteExtension(extensionName);
          refreshExtensions();
        },
        onCancel: () => void 0,
      });
    },
    [openPopup, refreshExtensions],
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
    if (shouldForceBanner) return true;
    // eslint-disable-next-line react-hooks/refs
    if (disabledExtensions.length !== initialDisabledStateRef.current.size)
      return true;

    for (const ext of disabledExtensions) {
      // eslint-disable-next-line react-hooks/refs
      if (!initialDisabledStateRef.current.has(ext)) return true;
    }

    if (updatedExtensions && updatedExtensions.length > 0) return true;

    return false;
  }, [disabledExtensions, shouldForceBanner, updatedExtensions]);

  const reloadWindow = useCallback(() => {
    bypassAndReload();
  }, [bypassAndReload]);

  const openInstallPopup = useCallback(
    () =>
      openPopup(
        <InstallPopup
          onInstall={() => {
            setShouldForceBanner(true);
            refreshExtensions();
          }}
        />,
        {
          title: 'Install New Extension',
        },
      ),
    [openPopup, refreshExtensions],
  );

  return (
    <>
      <Suspense>
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
            <div
              className="absolute bottom-4 right-4 text-sm text-muted bg-blurple rounded-full p-2 cursor-pointer hover:bg-blurple/80 transition"
              onClick={openInstallPopup}
            >
              <IconButton
                faIcon="fa-solid fa-plus"
                rounded
                tooltip="Add Extension"
              />
            </div>
          </div>
        </SettingsFrame>
      </Suspense>
    </>
  );
};

export default memo(ExtensionSettings);
