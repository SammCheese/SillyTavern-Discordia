/**
 * Startup compatibility self-check for the SillyTavern boundary.
 *
 * Discordia depends on ST internals (module exports and DOM anchors) that are
 * not a stable API. This check runs once at startup and loudly reports
 * anything missing, so an ST update that breaks a coupling produces a clear
 * diagnostic instead of a half-broken UI.
 */
import { scriptModule } from './script';
import { groupChatsModule } from './groupChats';
import { personasModule } from './personas';

// DOM anchors Discordia patches, hides, scrapes, or portals around.
const REQUIRED_DOM_ANCHORS = [
  '#top-bar',
  '#top-settings-holder',
  '#chat',
  '#sheld',
  '#send_form',
  '#form_sheld',
  '#send_textarea',
  '#send_but',
  '#leftSendForm',
  '#rightSendForm',
  '#options',
  '#extensionsMenu',
  '#extensions_settings',
  '#extensions_settings2',
];

// ST module members Discordia cannot function without.
const REQUIRED_MODULE_MEMBERS: Array<[string, object, string[]]> = [
  [
    '@script',
    scriptModule,
    [
      'eventSource',
      'event_types',
      'getEntitiesList',
      'getPastCharacterChats',
      'openCharacterChat',
      'getThumbnailUrl',
      'getRequestHeaders',
      'doNewChat',
      'characters',
      'saveSettingsDebounced',
    ],
  ],
  [
    '@scripts/groupChats',
    groupChatsModule,
    ['openGroupChat', 'getGroupPastChats', 'groups', 'openGroupById'],
  ],
  ['@scripts/personas', personasModule, ['getUserAvatars', 'setUserAvatar']],
];

export const runCompatSelfCheck = () => {
  const missing: string[] = [];

  for (const selector of REQUIRED_DOM_ANCHORS) {
    if (!document.querySelector(selector)) {
      missing.push(`DOM anchor ${selector}`);
    }
  }

  for (const [modName, mod, members] of REQUIRED_MODULE_MEMBERS) {
    for (const member of members) {
      if (typeof (mod as Record<string, unknown>)[member] === 'undefined') {
        missing.push(`${modName} → ${member}`);
      }
    }
  }

  if (missing.length === 0) {
    dislog.custom('COMPAT', 'SillyTavern compatibility self-check passed.');
    return;
  }

  dislog.error(
    `SillyTavern compatibility self-check found ${missing.length} missing coupling(s). ` +
      'A SillyTavern update may have broken Discordia:',
    missing,
  );
  toastr.warning(
    `${missing.length} SillyTavern integration point(s) are missing — some features may not work. Check the console for details.`,
    'Discordia Compatibility',
    { timeOut: 10000 },
  );
};
