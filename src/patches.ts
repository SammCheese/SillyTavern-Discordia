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

export type Patch = {
  name: string;
  run: () => void;
  antipatch?: () => void;
};

export const patches: Patch[] = [
  {
    name: 'ui-hideTopBar',
    run: () => $('#top-bar').hide(),
    antipatch: () => $('#top-bar').show(),
  },
  {
    name: 'ui-hideTopSettingsHolder',
    run: () => $('#top-settings-holder').hide(),
    antipatch: () => $('#top-settings-holder').show(),
  },
  { name: 'hijackJquery', run: hijackJquery },
  {
    name: 'ui-overrideSpinner',
    run: overrideSpinner,
    antipatch: unpatchSpinner,
  },
  {
    name: 'ui-angleSendButton',
    run: angleSendButton,
    antipatch: unangleSendButton,
  },
  {
    name: 'ui-combineChatMenu',
    run: combineChatMenu,
    antipatch: unpatchCombinedChatMenu,
  },
  { name: 'poolDOMExtensions', run: poolDOMExtensions },
];

const appliedPatches = new Set<string>();
let patchingActive = false;

export const applyPatch = (patch: Patch) => {
  if (appliedPatches.has(patch.name)) {
    return;
  }

  try {
    dislog.custom('PATCHER', `Applying Patch: ${patch.name}`);
    patch.run();
    appliedPatches.add(patch.name);
  } catch (error) {
    dislog.error(`Failed to Apply Patch: ${patch.name}`, error);
  }
};

export const revertPatch = (patch: Patch) => {
  if (!appliedPatches.has(patch.name)) {
    return;
  }

  if (!patch.antipatch) {
    appliedPatches.delete(patch.name);
    return;
  }

  try {
    dislog.custom('PATCHER', `Reverting Patch: ${patch.name}`);
    patch.antipatch();
  } catch (error) {
    dislog.error(`Failed to Revert Patch: ${patch.name}`, error);
  } finally {
    appliedPatches.delete(patch.name);
  }
};

export const addPatch = (patch: Patch) => {
  if (patches.some((existing) => existing.name === patch.name)) {
    dislog.warn(
      `Patch with name "${patch.name}" already exists. Ignoring duplicate registration.`,
    );
    return;
  }

  patches.push(patch);

  if (patchingActive) {
    applyPatch(patch);
  }
};

export const removePatch = (name: string) => {
  const index = patches.findIndex((patch) => patch.name === name);
  if (index !== -1) {
    const [patch] = patches.splice(index, 1);
    if (patch) {
      revertPatch(patch);
    }
  }
};

export const getPatches = () => patches;

export const getPatchByName = (name: string) =>
  patches.find((patch) => patch.name === name);

export const performPatches = async () => {
  patchingActive = true;

  for (const patch of patches) {
    applyPatch(patch);
  }
};

export const unpatchAll = async () => {
  patchingActive = false;

  for (const patch of patches) {
    revertPatch(patch);
  }
};
