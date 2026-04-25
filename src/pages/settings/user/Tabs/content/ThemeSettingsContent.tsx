import { SECTION_CARD_CLASS } from './shared';
import type { SettingsContentRenderer } from './types';

const ThemeSettingsContent: SettingsContentRenderer = () => {
  return (
    <div className={SECTION_CARD_CLASS}>
      <div className="text-2xl font-gg-sans-bold mb-2">Theme</div>
    </div>
  );
};

export default ThemeSettingsContent;
