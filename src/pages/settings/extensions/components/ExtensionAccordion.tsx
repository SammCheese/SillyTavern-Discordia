import { memo, useCallback, useMemo, useState } from 'react';
import SettingsHost from './SettingsHost';
import ErrorBoundary from '../../../../components/common/ErrorBoundary/ErrorBoundary';
import Accordion from '../../../../components/common/Accordion/Accordion';
import Skeleton from 'react-loading-skeleton';
import { type Manifest } from '../../../../services/extensionService';
import type { ExtensionInfo, Version } from '../ExtensionSettings';
import Divider from '../../../../components/common/Divider/Divider';
import {
  getExtensionVersion,
  updateExtension,
} from '../service/extensionService';
import ExtensionTitle from './ExtensionAccordion/ExtensionTitle';
import ExtensionDetails from './ExtensionAccordion/ExtensionDetails';
import ExtensionOptions from './ExtensionAccordion/ExtensionOptions';

interface ExtensionAccordionProps {
  extension: ExtensionInfo;
  onToggle: (ext: ExtensionInfo) => void;
  settings?: JQuery<HTMLElement> | null | undefined;
  manifest?: Manifest | undefined;
  disabled?: boolean;
  version?: Version | undefined;
  onDelete?: (ext: ExtensionInfo) => void;
}

const ExtensionAccordion = memo(function ExtensionAccordion({
  extension,
  manifest,
  onToggle,
  settings,
  disabled = false,
  version,
  onDelete,
}: ExtensionAccordionProps) {
  const [updatedVersion, setUpdatedVersion] = useState<Version | undefined>();
  const [isUpdating, setIsUpdating] = useState(false);

  const currentVersion = updatedVersion ?? version;

  const isLoading = !manifest;

  const handleToggle = useCallback(() => {
    onToggle(extension);
  }, [onToggle, extension]);

  const handleUpdateClick = useCallback(() => {
    setIsUpdating(true);
    updateExtension(extension.name)
      .then(() => {
        getExtensionVersion(extension.name).then((version) => {
          setUpdatedVersion(version);
        });
      })
      .catch((error) => {
        console.error(`Failed to update extension ${extension.name}:`, error);
      })
      .finally(() => {
        setIsUpdating(false);
      });
  }, [extension.name]);

  const title = useMemo(
    () => manifest?.display_name ?? extension.name,
    [manifest?.display_name, extension.name],
  );

  const handleDelete = useCallback(() => {
    onDelete?.(extension);
  }, [onDelete, extension]);

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
          hasUpdates={currentVersion?.isUpToDate === false}
          onUpdateClick={handleUpdateClick}
          isUpdating={isUpdating}
        />
      }
    >
      <ErrorBoundary>
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <ExtensionDetails manifest={manifest} version={currentVersion} />

            <ExtensionOptions
              extension={extension}
              disabled={disabled}
              handleToggle={handleToggle}
              handleDelete={handleDelete}
            />
          </div>
          <Divider />
          <SettingsHost settings={settings} disabled={disabled} />
        </div>
      </ErrorBoundary>
    </Accordion>
  );
});

export default memo(ExtensionAccordion);
