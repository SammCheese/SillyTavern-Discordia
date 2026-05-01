import { SECTION_CARD_CLASS } from '../shared/shared';
import type { SettingsContentRenderer } from '../shared/types';

const DiscordiaSettingsContent: SettingsContentRenderer = ({ item }) => (
  <div className={SECTION_CARD_CLASS}>
    <div className="text-2xl font-gg-sans-bold mb-2">{item.label}</div>
    {item.description && (
      <div className="text-sm opacity-80">{item.description}</div>
    )}
  </div>
);

export default DiscordiaSettingsContent;
