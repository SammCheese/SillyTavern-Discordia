import { memo, useCallback, useEffect, useState } from 'react';
import SettingsHost from './SettingsHost';
import ErrorBoundary from '../../../../components/common/ErrorBoundary/ErrorBoundary';
import Accordion from '../../../../components/common/Accordion/Accordion';
import Skeleton from 'react-loading-skeleton';
import { getManifests } from '../../../../services/extensionService';
import type { ExtensionInfo } from '../ExtensionSettings';
import Divider from '../../../../components/common/Divider/Divider';
import Toggle from '../../../../components/common/Toggle/Toggle';

interface ExtensionAccordionProps {
  extension: ExtensionInfo;
  onToggle: (ext: ExtensionInfo) => void;
  settings?: JQuery<HTMLElement> | null | undefined;
}

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

export default memo(ExtensionAccordion);
