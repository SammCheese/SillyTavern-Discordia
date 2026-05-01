import Button, {
  ButtonLook,
} from '../../../../../components/common/Button/Button';
import { SECTION_CARD_CLASS } from '../shared/shared';
import type { SettingsContentRenderer } from '../shared/types';

const { isAdmin, currentUser } = await imports('@scripts/user');

const AccountSettingsContent: SettingsContentRenderer = () => {
  return (
    <div className={SECTION_CARD_CLASS}>
      <div className="text-2xl font-gg-sans-bold mb-2">Account</div>

      <div className="bg-secondary rounded-lg p-4">
        <div className="flex flex-row items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden">
            <img
              src={currentUser.avatar}
              loading="lazy"
              alt="Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="flex flex-col">
              <div className="text-lg font-gg-sans-bold">
                {currentUser.name}
              </div>
              <div className="text-sm text-gray-500">{currentUser.handle}</div>
            </div>

            <div className="bg-blurple text-white rounded-md px-3 py-0 mt-1 inline-block self-baseline">
              {isAdmin() ? 'Admin' : 'User'}
            </div>
          </div>
        </div>

        <div>
          <div className="text-lg font-gg-sans-bold mt-4">Actions</div>

          <div className="flex flex-col gap-2 mt-2">
            <Button look={ButtonLook.PRIMARY}> Change Password </Button>
            <Button look={ButtonLook.PRIMARY}> Settings Snapshots </Button>
            <Button look={ButtonLook.PRIMARY}> Download Backup </Button>
          </div>
        </div>

        <div>
          <div className="text-lg font-gg-sans-bold mt-4">Danger Zone</div>

          <div className="flex flex-col gap-2 mt-2">
            <Button look={ButtonLook.DANGER}> Reset Settings </Button>
            <Button look={ButtonLook.DANGER}> Reset Everything </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsContent;
