import { SECTION_CARD_CLASS } from './shared';
import type { SettingsContentRenderer } from './types';

const MessageDisplaySettingsContent: SettingsContentRenderer = () => (
  <div className={SECTION_CARD_CLASS}>
    <div className="text-2xl font-gg-sans-bold mb-2">Message Display</div>
  </div>
);

export default MessageDisplaySettingsContent;
