import IconButton from '../../../../../components/common/IconButton/IconButton';
import Toggle from '../../../../../components/common/Toggle/Toggle';
import type { ExtensionInfo } from '../../ExtensionSettings';

interface ExtensionOptionsProps {
  extension: ExtensionInfo;
  disabled: boolean;
  handleToggle: () => void;
  handleDelete: () => void;
}

const ExtensionOptions = ({
  extension,
  disabled,
  handleToggle,
  handleDelete,
}: ExtensionOptionsProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <label htmlFor={`${extension.name}-enabled`}> Enabled </label>
      </div>
      <div className="flex items-center gap-2">
        <Toggle isOn={!disabled} onToggle={handleToggle} />
        {extension.type !== 'system' && (
          <div className="flex justify-end">
            <IconButton
              faIcon="fa fa-solid fa-trash"
              color="#f87171"
              tooltip="Uninstall Extension"
              onClick={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default ExtensionOptions;
