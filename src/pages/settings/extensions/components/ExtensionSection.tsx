import { memo, useCallback } from 'react';
import ExtensionAccordion from './ExtensionAccordion';
import type { ExtensionInfo } from '../ExtensionSettings';

interface ExtensionSectionProps {
  title: string;
  extensions: ExtensionInfo[];
  onToggle: (ext: ExtensionInfo) => void;
  onDelete: (extension: ExtensionInfo) => void;
}

const ExtensionSection = ({
  title,
  extensions,
  onToggle,
  onDelete,
}: ExtensionSectionProps) => {
  const handleDelete = useCallback(
    (extension: ExtensionInfo) => {
      onDelete(extension);
    },
    [onDelete],
  );

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
            onDelete={handleDelete}
            {...ext}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(ExtensionSection);
