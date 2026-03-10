import { hijackJquery, poolDOMExtensions } from './patches/settingsHijack';
import {
  overrideSpinner,
  angleSendButton,
  combineChatMenu,
} from './patches/overrides';
import {
  unangleSendButton,
  unpatchCombinedChatMenu,
  unpatchSpinner,
} from './patches/unpatch';

type Patch = {
  name: string;
  run: () => void;
  antipatch?: () => void;
};

const patches: Patch[] = [
  { name: 'hijackJquery', run: hijackJquery },
  { name: 'overrideSpinner', run: overrideSpinner, antipatch: unpatchSpinner },
  {
    name: 'angleSendButton',
    run: angleSendButton,
    antipatch: unangleSendButton,
  },
  {
    name: 'combineChatMenu',
    run: combineChatMenu,
    antipatch: unpatchCombinedChatMenu,
  },
  { name: 'poolDOMExtensions', run: poolDOMExtensions },
];

export const performPatches = async () => {
  for (const patch of patches) {
    try {
      dislog.custom('PATCHER', `Applying Patch: ${patch.name}`);
      patch.run();
    } catch (error) {
      dislog.error(`Failed to Apply Patch: ${patch.name}`, error);
    }
  }
};

export const unpatchAll = async () => {
  for (const patch of patches) {
    if (!patch.antipatch) continue;
    try {
      dislog.custom('PATCHER', `Reverting Patch: ${patch.name}`);
      patch.antipatch();
    } catch (error) {
      dislog.error(`Failed to Revert Patch: ${patch.name}`, error);
    }
  }
};
