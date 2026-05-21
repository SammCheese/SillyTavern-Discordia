import { SECTION_CARD_CLASS } from '../shared/shared';
import type { SettingsContentRenderer } from '../shared/types';

const MessageDisplaySettingsContent: SettingsContentRenderer = () => (
  <div className={SECTION_CARD_CLASS}>
    <div className="text-2xl font-gg-sans-bold mb-2">Message Display</div>

    <div className="p-4">
      <div>
        <span className="text-lg font-gg-sans-bold">Coming Soon</span>
        <p className="text-gray-500">This section is under development.</p>
      </div>
    </div>
  </div>
);

export default MessageDisplaySettingsContent;
