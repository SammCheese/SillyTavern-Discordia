import { applyPatch, patches, revertPatch, unpatchAll } from '../patches';

const { saveSettingsDebounced } = await imports('@script');

const disableDiscordia = async (permanent = false) => {
  // First attempt to disable the extension the normal way
  try {
    if (permanent) {
      const settings = SillyTavern.getContext().extensionSettings;

      (SillyTavern.getContext().extensionSettings
        .disabledExtensions as string[]) = [
        ...(settings.disabledExtensions || []),
        'SillyTavern-Discordia',
      ];

      await saveSettingsDebounced();
    }

    // We cant know when the settings have been saved. We'll unpatch and launch the normal SillyTavern UI.

    await unpatchAll();
    // Remove the Stylesheets to prevent UI conflicts
    document.getElementById('third-party_SillyTavern-Discordia-css')?.remove();
    // Remove the root container to unmount React
    document.getElementById('discordia-root')?.remove();

    // Remove preload elements
    document
      .querySelectorAll('link[href*="SillyTavern-Discordia"]')
      .forEach((link) => {
        link.remove();
      });
  } catch (error) {
    dislog.error('Error disabling Discordia', error);
  }
};

const addDiscordiaRestoreButton = () => {
  const container = document.createElement('div');
  container.className = 'drawer';
  container.id = 'discordia-restore-drawer';

  const drawerHeader = document.createElement('div');
  drawerHeader.className = 'drawer-header';
  container.appendChild(drawerHeader);

  const icon = document.createElement('div');
  icon.className =
    'drawer-icon fa-brands fa-discord fa-fw closedIcon interactable';
  icon.title = 'Restore Discordia UI';
  icon.role = 'button';
  icon.tabIndex = 0;
  icon.setAttribute('aria-label', 'Restore Discordia UI');

  drawerHeader.appendChild(icon);

  icon.addEventListener('click', () => {
    showDiscordia();
    container.remove();
  });

  container.appendChild(icon);
  (document.getElementById('top-settings-holder') || document.body).appendChild(
    container,
  );
};

const hideDiscordia = () => {
  // hide the UI
  const root = document.getElementById('discordia-root');
  if (root) {
    root.style.display = 'none';
  }

  // Temporarily Disable the Stylesheet to prevent UI conflicts
  const stylesheet = document.getElementById(
    'third-party_SillyTavern-Discordia-css',
  ) as HTMLLinkElement;

  if (stylesheet) {
    stylesheet.disabled = true;
  }

  // Unpatch the UI patches
  const uiPatches = patches.filter((p) => p.name.startsWith('ui-'));
  uiPatches.forEach(revertPatch);

  // Add a button to restore the UI
  addDiscordiaRestoreButton();
};

const showDiscordia = () => {
  // Restore Stylesheet first to prevent weird flashes of unstyled content
  const stylesheet = document.getElementById(
    'third-party_SillyTavern-Discordia-css',
  ) as HTMLLinkElement;

  if (stylesheet) {
    stylesheet.disabled = false;
  }

  const root = document.getElementById('discordia-root');
  if (root) {
    root.style.display = 'block';
  }

  // Reapply UI patches
  const uiPatches = patches.filter((p) => p.name.startsWith('ui-'));
  uiPatches.forEach(applyPatch);
};

export { hideDiscordia, showDiscordia, disableDiscordia };
