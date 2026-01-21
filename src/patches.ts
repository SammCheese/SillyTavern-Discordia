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

  try {
    for (const patch of patches) {
      await Promise.resolve(patch.run());
    }
  } catch (error) {
    console.error('Failed to Perform Patches:', error);
  }
};
