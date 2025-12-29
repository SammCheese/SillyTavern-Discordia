import { memo } from 'react';
import type { Manifest } from '../../../../../services/extensionService';
import type { Version } from '../../ExtensionSettings';

interface ExtensionDetailsProps {
  manifest: Manifest | undefined;
  version: Version | undefined;
}

const ExtensionDetails = ({ manifest, version }: ExtensionDetailsProps) => {
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
};

export default memo(ExtensionDetails);
