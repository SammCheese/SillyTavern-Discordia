import { runTaskInIdle } from '../../../../utils/utils';
import type { ExtensionInfo } from '../ExtensionSettings';

const { getRequestHeaders } = await imports('@script');

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

/**
 * Gets the type of an extension based on its external ID.
 * @param {string} externalId External ID of the extension (excluding or including the leading 'third-party/')
 * @returns {string} Type of the extension (global, local, system, or empty string if not found)
 */
async function getExtensionType(externalId) {
  const { extensionTypes } = await imports('@scripts/extensions');
  const id = Object.keys(extensionTypes).find(
    (id) =>
      id === externalId ||
      (id.startsWith('third-party') && id.endsWith(externalId)),
  );
  return id ? extensionTypes[id] : '';
}

export async function getExtensionVersion(extensionName, signal?) {
  try {
    const response = await fetch('/api/extensions/version', {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify({
        extensionName: extensionName.replace('third-party/', ''),
        global: (await getExtensionType(extensionName)) === 'global',
      }),
      signal,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function updateExtension(extensionName) {
  try {
    const response = await fetch('/api/extensions/update', {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify({
        extensionName: extensionName.replace('third-party/', ''),
        global: (await getExtensionType(extensionName)) === 'global',
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      // @ts-expect-error exists
      toastr.error(text || response.statusText, 'Extension update failed', {
        timeOut: 5000,
      });
      console.error(
        'Extension update failed',
        response.status,
        response.statusText,
        text,
      );
      return;
    }

    const data = await response.json();
    // @ts-expect-error exists
    toastr.success(
      `Extension ${extensionName} updated to ${data.shortCommitHash}`,
      'Extension updated',
      { timeOut: 3000 },
    );
    return data;
  } catch (error) {
    console.error('Extension update error:', error);
  }
}

export type ExtensionRecord = {
  name: string;
  elem: JQuery<HTMLElement> | null;
};

export type Extension = {
  [key: string]: ExtensionRecord;
};

const knownNamesCache = new WeakMap<string[], Set<string>>();

function getKnownNamesSet(knownNames?: string[]): Set<string> | null {
  if (!knownNames) return null;

  if (!knownNamesCache.has(knownNames)) {
    knownNamesCache.set(knownNames, new Set(knownNames));
  }
  return knownNamesCache.get(knownNames) || null;
}

const INTERACTIVE_SELECTOR = 'input, select, textarea, button' as const;

const applyStyles = (content: JQuery) => {
  content.css({ width: '100%', boxSizing: 'border-box', display: 'block' });
};

function* extensionProcessorGenerator(
  elements: JQuery<Element>[],
  knownNamesSet: Set<string> | null,
): Generator<null | ExtensionRecord, void, unknown> {
  const batchSize = 5;
  let processedCount = 0;

  for (const element of elements) {
    const content = element.find('.inline-drawer-content');
    if (content.length === 0) continue;

    const interactives = content.find(INTERACTIVE_SELECTOR);
    if (interactives.length === 0) continue;

    const heuristics = new Map<string, number>();
    interactives.each((_: number, interactive: HTMLElement) => {
      const owner = interactive.getAttribute('discordia-settings-owner') || 'unknown';
      heuristics.set(owner, (heuristics.get(owner) ?? 0) + 1);
    });

    const probableOwner = Array.from(heuristics.entries()).reduce(
      (max, [owner, count]) => (count > max.count ? { owner, count } : max),
      { owner: 'unknown', count: 0 },
    ).owner;

    if (knownNamesSet && !knownNamesSet.has(probableOwner)) {
      continue;
    }

    applyStyles(content);

    yield { name: probableOwner, elem: content };

    processedCount++;

    if (processedCount % batchSize === 0) {
        yield null;
    }
  }
}

export async function processExtensionHTMLs(
  knownNames?: string[],
  signal?: AbortSignal,
): Promise<ExtensionRecord[]> {
  const elements = window.discordia.extensionTemplates || [];
  if (elements.length === 0) return [];

  const knownNamesSet = getKnownNamesSet(knownNames);

  const generator = extensionProcessorGenerator(elements, knownNamesSet);

  return runTaskInIdle(generator, signal);
}
