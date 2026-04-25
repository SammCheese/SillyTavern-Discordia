import { SECTION_CARD_CLASS } from './shared';
import type { SettingsContentRenderer } from './types';

const AccountSettingsContent: SettingsContentRenderer = () => (
  <div className={SECTION_CARD_CLASS}>
    <div className="text-2xl font-gg-sans-bold mb-2">Account</div>
  </div>
);

export default AccountSettingsContent;
