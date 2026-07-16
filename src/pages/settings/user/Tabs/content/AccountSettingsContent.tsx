import Button, {
  ButtonLook,
} from '../../../../../components/common/Button/Button';
import { SECTION_CARD_CLASS } from '../shared/shared';
import type { SettingsContentRenderer } from '../shared/types';

import { isAdmin, currentUser } from '../../../../../st/user';
const AccountSettingsContent: SettingsContentRenderer = () => {
  return (
    <div className={SECTION_CARD_CLASS}>
      <div className="text-2xl font-gg-sans-bold mb-2">Account</div>

      <div className="bg-secondary rounded-lg p-4">
        <div className="flex flex-row items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden">
            <img
              src={currentUser?.avatar ?? 'user-default.png'}
              loading="lazy"
              alt="Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="flex flex-col">
              <div className="text-lg font-gg-sans-bold">
                {currentUser?.name ??
                  SillyTavern.getContext().name1 ??
                  'Unknown User'}
              </div>
              <div className="text-sm text-gray-500">
                {currentUser?.handle ?? 'Unknown Handle'}
              </div>
            </div>

            <div className="bg-blurple text-white rounded-md px-3 py-0 mt-1 inline-block self-baseline">
              {isAdmin() ? 'Admin' : 'User'}
            </div>
          </div>
        </div>

        <div>
          <div className="text-lg font-gg-sans-bold mt-4">Actions</div>

          <div className="flex flex-col gap-2 mt-2">
            <Button look={ButtonLook.PRIMARY} disabled>
              {' '}
              Change Password{' '}
            </Button>
            <Button look={ButtonLook.PRIMARY} disabled>
              {' '}
              Settings Snapshots{' '}
            </Button>
            <Button look={ButtonLook.PRIMARY} disabled>
              {' '}
              Download Backup{' '}
            </Button>
          </div>
        </div>

        <div>
          <div className="text-lg font-gg-sans-bold mt-4">Danger Zone</div>

          <div className="flex flex-col gap-2 mt-2">
            <Button look={ButtonLook.DANGER} disabled>
              {' '}
              Reset Settings{' '}
            </Button>
            <Button look={ButtonLook.DANGER} disabled>
              {' '}
              Reset Everything{' '}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsContent;
