import { memo } from 'react';
import Card, {
  CardBackground,
  CardBorder,
  CardColor,
} from '../../../../components/common/Card/Card';
import Button from '../../../../components/common/Button/Button';

interface PendingChangesBannerProps {
  onReload: () => void;
}

const PendingChangesBanner = ({ onReload }: PendingChangesBannerProps) => {
  return (
    <div className="mb-6 mt-6 w-full top-16 left-0 px-6 z-50 pointer-events-none">
      <Card
        color={CardColor.YELLOW}
        border={CardBorder.DASHED}
        background={CardBackground.YELLOW}
        className="p-4 mb-4 flex flex-row justify-between items-center pointer-events-auto shadow-md"
      >
        <div className="font-medium">
          <div>
            <i className="fa-solid fa-exclamation-triangle mr-2 text-yellow-700" />
            <span>
              <strong>Note: </strong>
              Some Changes may require a reload to take effect
            </span>
          </div>
          <Button onClick={onReload}>Reload</Button>
        </div>
      </Card>
    </div>
  );
};

export default memo(PendingChangesBanner);
