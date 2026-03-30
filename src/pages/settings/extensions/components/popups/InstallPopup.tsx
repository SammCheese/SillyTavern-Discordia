import { useState, memo, useCallback } from 'react';
import Button, {
  ButtonLook,
} from '../../../../../components/common/Button/Button';
import { usePopup } from '../../../../../providers/popupProvider';
import Input from '../../../../../components/common/Input/Input';
import Checkbox from '../../../../../components/common/Checkbox/Checkbox';

const { installExtension } = await imports('@scripts/extensions');

interface InstallPopupProps {
  onClose?: () => void;
  onInstall?: () => void;
}

const InstallPopup = ({ onClose, onInstall }: InstallPopupProps) => {
  const { closePopup } = usePopup();
  const [url, setUrl] = useState('');
  const [branch, setBranch] = useState('');
  const [localOnly, setLocalOnly] = useState(false);

  const handleInstall = useCallback(async () => {
    if (!url) {
      toastr.warning('What are you doing? Enter a URL!');
      return;
    }
    await installExtension(url, !localOnly, branch || undefined);
    closePopup();
    onInstall?.();
  }, [url, branch, localOnly, closePopup, onInstall]);

  const handleClose = useCallback(() => {
    onClose?.();
    closePopup();
  }, [closePopup, onClose]);

  const handleUrlChange = useCallback((value: string) => {
    setUrl(value);
  }, []);

  const handleBranchChange = useCallback((value: string) => {
    setBranch(value);
  }, []);

  const handleLocalOnlyChange = useCallback((checked: boolean) => {
    setLocalOnly(checked);
  }, []);

  return (
    <div>
      <div className="mb-4">
        Enter the GitHub URL of the extension you want to install.
      </div>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="'https://github.com/SillyTavern/Example-Extension'"
          value={url}
          onChange={handleUrlChange}
        />
      </div>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="branch name e.g. 'dev', 'main' (optional)"
          value={branch}
          onChange={handleBranchChange}
        />
      </div>
      <div>
        <Checkbox
          label="Install for current user only (local)"
          checked={localOnly}
          onChange={handleLocalOnlyChange}
        />
      </div>

      <div className="mt-6 flex flex-row justify-end gap-2">
        <Button look={ButtonLook.TRANSPARENT} onClick={handleClose}>
          Cancel
        </Button>
        <Button look={ButtonLook.PRIMARY} onClick={handleInstall}>
          Install
        </Button>
      </div>
    </div>
  );
};

export default memo(InstallPopup);
