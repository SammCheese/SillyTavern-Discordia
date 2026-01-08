
import { hijackJquery, poolDOMExtensions } from './patches/settingsHijack';
import { overrideSpinner, angleSendButton, combineChatMenu } from './patches/overrides';



export const performPatches = async () => {
  try {
    hijackJquery();
    overrideSpinner();
    angleSendButton();
    combineChatMenu();
    poolDOMExtensions();
  } catch (error) {
    console.error('Failed to Perform Patches:', error);
  }
};



