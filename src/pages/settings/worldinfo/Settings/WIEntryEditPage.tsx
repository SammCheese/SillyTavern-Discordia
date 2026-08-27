import { memo, useCallback, useState } from 'react';
import Button, {
  ButtonLook,
} from '../../../../components/common/Button/Button';

interface WIEntryEditPageProps {
  entry: string;
  onSave: (entry: string) => void;
  onCancel: () => void;
}

const WIEntryEditPage = ({ entry, onSave, onCancel }: WIEntryEditPageProps) => {
  const [editedEntry] = useState(entry);

  const handleSave = useCallback(() => {
    onSave(editedEntry);
  }, [onSave, editedEntry]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button
            label="< Back"
            onClick={handleCancel}
            look={ButtonLook.LINK}
          />
        </div>
      </div>

      <div>Still in progress!!</div>

      <div className="flex justify-end gap-2 mt-4">
        <Button
          label="Cancel"
          onClick={handleCancel}
          look={ButtonLook.SECONDARY}
        />
        <Button label="Save" onClick={handleSave} look={ButtonLook.PRIMARY} />
      </div>
    </div>
  );
};

export default memo(WIEntryEditPage);
