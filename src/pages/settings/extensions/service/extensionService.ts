import type { ExtensionInfo } from "../ExtensionSettings";

export async function discoverExtensions(): Promise<ExtensionInfo[]> {
  try {
    const response = await fetch('/api/extensions/discover');

    if (response.ok) {
      const extensions = await response.json();
      return extensions;
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function renderExtensionSettings(extensionName: string): Promise<string> {
  try {
    const response = await fetch(`/api/extensions/${encodeURIComponent(extensionName)}/settings`);

    if (response.ok) {
      const settingsHtml = await response.text();
      return settingsHtml;
    } else {
      return `<div class="text-red-500">Failed to load settings for extension: ${extensionName}</div>`;
    }
  } catch (err) {
    console.error(err);
    return `<div class="text-red-500">Error loading settings for extension: ${extensionName}</div>`;
  }
}

export type ExtensionRecord = {
  name: string;
  elem: JQuery<HTMLElement> | null;
};

export type Extension = {
  [key: string]: ExtensionRecord;
};

export async function processExtensionHTMLs(knownNames?: string[]): Promise<ExtensionRecord[]> {
  const elements = window.discordia.extensionTemplates || [];
  const extensions: ExtensionRecord[] = [];

  for (const element of elements) {
    const content = element.find('.inline-drawer-content');
    if (content.length === 0) continue;

    const interactives = content.find("input, select, textarea, button");
    if (interactives.length === 0) continue;
    const heuristics: Record<string, number> = {};

    interactives.each((_, interactive) => {
      const owner = interactive.getAttribute('discordia-settings-owner') || 'unknown';
      heuristics[owner] = (heuristics[owner] || 0) + 1;
    });

    let probableOwner = 'unknown';
    let maxCount = 0;
    for (const [owner, count] of Object.entries(heuristics)) {
      if (count > maxCount) {
        maxCount = count;
        probableOwner = owner;
      }
    }

    if (knownNames && !knownNames.includes(probableOwner)) {
      continue;
    }

    content.attr('style', 'width: 100%; box-sizing: border-box; display: block;');

    extensions.push({
      name: probableOwner,
      elem: content,
    });
  }

  return extensions;
}
