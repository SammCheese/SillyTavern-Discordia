import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import SettingsHost from './SettingsHost';
import ErrorBoundary from '../../../../components/common/ErrorBoundary/ErrorBoundary';
import Accordion from '../../../../components/common/Accordion/Accordion';
import Skeleton from 'react-loading-skeleton';
import { type Manifest } from '../../../../services/extensionService';
import type { ExtensionInfo, Version } from '../ExtensionSettings';
import Divider from '../../../../components/common/Divider/Divider';
import Toggle from '../../../../components/common/Toggle/Toggle';
import IconButton from '../../../../components/common/IconButton/IconButton';
import { updateExtension } from '../service/extensionService';

interface ExtensionAccordionProps {
  extension: ExtensionInfo;
  onToggle: (ext: ExtensionInfo) => void;
  settings?: JQuery<HTMLElement> | null | undefined;
  manifest?: Manifest | undefined;
  disabled?: boolean;
  version?: Version | undefined;
}

interface TitleProps {
  title: string;
  disabled: boolean;
  hasSettings: boolean;
  hasUpdates: boolean;
  onUpdateClick?: () => void;
}

const ExtensionTitle = memo(function ExtensionTitle({
  title,
  disabled,
  hasSettings,
  hasUpdates,
  onUpdateClick,
}: TitleProps) {
  const handleUpdateClick = useCallback(
    (event) => {
      event.stopPropagation();
      onUpdateClick?.();
    },
    [onUpdateClick],
  );

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        {hasSettings && (
          <div className="fa fa-solid fa-cog" title="Has Settings" />
        )}

        <label
          title={`${title}${disabled ? ' (Disabled)' : ''}`}
          className="text-lg font-medium"
          style={{ opacity: disabled ? 0.5 : 1 }}
        >
          {title}
        </label>
      </div>
      <div className="flex items-center gap-2 ml-auto mr-2">
        {hasUpdates && (
          <>
            <IconButton
              size={18}
              faIcon="fa fa-solid fa-download"
              color="#4ade80"
              tooltip="Update Available"
              onClick={handleUpdateClick}
            ></IconButton>
          </>
        )}
      </div>
    </div>
  );
});

interface ExtensionDetailsProps {
  manifest: Manifest | undefined;
  version: Version | undefined;
}

const ExtensionDetails = memo(function ExtensionDetails({
  manifest,
  version,
}: ExtensionDetailsProps) {
  return (
    <div className="mb-2">
      <div className="flex flex-row gap-1 mb-2 justify-between ">
        <span className="text-sm truncate">
          <div className="fa fa-solid fa-book me-2" />
          <b>Version:</b> {manifest?.version || 'N/A'}
        </span>
        <span className="text-sm  truncate">
          <div className="fa fa-solid fa-user me-2" />
          <b>Author:</b> <span>{manifest?.author || 'N/A'}</span>
        </span>
      </div>

      {version && (
        <div className="flex flex-row gap-1 justify-between">
          <span className="text-sm truncate">
            <div className="fa fa-solid fa-link me-2" />
            <b>Branch:</b> {version.currentBranchName || 'N/A'}
          </span>

          <span className="text-sm truncate">
            <div className="fa fa-solid fa-code-commit me-2" />
            <b>Commit:</b>{' '}
            <a
              className=""
              href={`${version.remoteUrl}/commit/${version.currentCommitHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hover:opacity-50 transition-opacity duration-200 truncate">
                {version.currentCommitHash.substring(0, 7) || 'N/A'}
              </span>
            </a>
          </span>
        </div>
      )}
    </div>
  );
});

const ExtensionAccordion = memo(function ExtensionAccordion({
  extension,
  manifest,
  onToggle,
  settings,
  disabled = false,
  version,
}: ExtensionAccordionProps) {
  const [versionState, setVersionState] = useState<Version | undefined>(
    version,
  );

  useEffect(() => {
    setVersionState(version);
  }, [version]);

  const isLoading = !manifest;

  const handleToggle = useCallback(() => {
    onToggle(extension);
  }, [onToggle, extension]);

  const handleUpdateClick = useCallback(() => {
    updateExtension(extension.name)
      .then(() => {
        setVersionState((prev) => {
          const base = prev ?? version;
          if (!base) return prev ?? version;
          return { ...base, isUpToDate: true } as Version;
        });
      })
      .catch((error) => {
        console.error(`Failed to update extension ${extension.name}:`, error);
      });
  }, [extension.name, version]);

  const title = useMemo(
    () => manifest?.display_name ?? extension.name,
    [manifest?.display_name, extension.name],
  );

  if (isLoading) {
    return (
      <Accordion title={<Skeleton width={150} enableAnimation />}>
        <div className="p-4 flex items-center justify-between" />
      </Accordion>
    );
  }

  return (
    <Accordion
      title={
        <ExtensionTitle
          title={title}
          disabled={disabled}
          hasSettings={!!settings}
          hasUpdates={versionState?.isUpToDate === false}
          onUpdateClick={handleUpdateClick}
        />
      }
    >
      <ErrorBoundary>
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <ExtensionDetails manifest={manifest} version={versionState} />
            <div className="flex items-center gap-2 justify-between">
              <label htmlFor={`${extension.name}-enabled`}> Enabled </label>
              <Toggle isOn={!disabled} onToggle={handleToggle} />
            </div>
          </div>
          <Divider />
          <SettingsHost settings={settings} disabled={disabled} />
        </div>
      </ErrorBoundary>
    </Accordion>
  );
});

export default memo(ExtensionAccordion);
