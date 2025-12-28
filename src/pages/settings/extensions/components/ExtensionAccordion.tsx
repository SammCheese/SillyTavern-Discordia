import { memo, useCallback, useMemo } from 'react';
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

const Title = memo(function Title({
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

const ExtensionAccordion: React.FC<ExtensionAccordionProps> = memo(
  function ExtensionAccordion({
    extension,
    manifest,
    onToggle,
    settings,
    disabled = false,
    version,
  }: ExtensionAccordionProps) {
    const isLoading = !manifest;

    const handleToggle = useCallback(() => {
      onToggle(extension);
    }, [onToggle, extension]);

    const handleUpdateClick = useCallback(() => {
      updateExtension(extension.name);
    }, [extension.name]);

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
          <Title
            title={title}
            disabled={disabled}
            hasSettings={!!settings}
            hasUpdates={!!version?.isUpToDate}
            onUpdateClick={handleUpdateClick}
          />
        }
      >
        <ErrorBoundary>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-sm">
                  <div className="fa fa-solid fa-book me-2" />
                  <b>Version:</b> {manifest?.version || 'N/A'}
                </span>
                <span className="text-sm">
                  <div className="fa fa-solid fa-user me-2" />
                  <b>Author:</b> {manifest?.author || 'N/A'}
                </span>
                {version && (
                  <span className="text-sm">
                    <div className="fa fa-solid fa-link me-2" />
                    <b>Branch:</b> {version.currentBranchName || 'N/A'}
                  </span>
                )}
              </div>
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
  },
);

export default memo(ExtensionAccordion);
