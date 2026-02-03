import { hijackJquery, poolDOMExtensions } from './patches/settingsHijack';
import {
  overrideSpinner,
  angleSendButton,
  combineChatMenu,
} from './patches/overrides';

export const performPatches = async () => {
  const patches = [
    { name: 'hijackJquery', run: hijackJquery },
    { name: 'overrideSpinner', run: overrideSpinner },
    { name: 'angleSendButton', run: angleSendButton },
    { name: 'combineChatMenu', run: combineChatMenu },
    { name: 'poolDOMExtensions', run: poolDOMExtensions },
  ];

  for (const patch of patches) {
    try {
      dislog.custom('PATCHER', `Applying Patch: ${patch.name}`);
      patch.run();
    } catch (error) {
      dislog.error(`Failed to Apply Patch: ${patch.name}`, error);
    }
  }
};
