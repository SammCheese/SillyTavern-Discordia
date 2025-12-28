
import { hijackJqueryError, poolDOMExtensions } from './patches/hijacks';
import { overrideSpinner, angleSendButton, combineChatMenu } from './patches/overrides';



export const performPatches = async () => {
  try {
    hijackJqueryError();
    overrideSpinner();
    angleSendButton();
    combineChatMenu();
    poolDOMExtensions();
  } catch (error) {
    console.error('Failed to Perform Patches:', error);
  }
};



