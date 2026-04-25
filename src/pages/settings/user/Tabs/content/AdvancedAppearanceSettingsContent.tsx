import { SECTION_CARD_CLASS } from './shared';
import type { SettingsContentRenderer } from './types';

const AdvancedAppearanceSettingsContent: SettingsContentRenderer = () => (
  <div className={SECTION_CARD_CLASS}>
    <div className="text-2xl font-gg-sans-bold mb-2">Advanced Appearance</div>
  </div>
);

export default AdvancedAppearanceSettingsContent;
