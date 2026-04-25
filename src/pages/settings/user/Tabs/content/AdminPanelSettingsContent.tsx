import { SECTION_CARD_CLASS } from './shared';
import type { SettingsContentRenderer } from './types';

const AdminPanelSettingsContent: SettingsContentRenderer = () => (
  <div className={SECTION_CARD_CLASS}>
    <div className="text-2xl font-gg-sans-bold mb-2">Admin Panel</div>
  </div>
);

export default AdminPanelSettingsContent;
