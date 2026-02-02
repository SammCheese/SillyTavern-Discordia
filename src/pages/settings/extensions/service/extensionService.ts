import { runTaskInIdle } from '../../../../utils/utils';
import { getOwner } from '../../../../patches/settingsHijack';
import type { ExtensionInfo } from '../ExtensionSettings';

const { getRequestHeaders } = await imports('@script');

let extensionTypesCache: Record<string, string> | null = null;

export async function discoverExtensions(): Promise<ExtensionInfo[]> {
  try {
    const response = await fetch('/api/extensions/discover');

    if (response.ok) {
      return await response.json();
    }

    return [];
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
  if (!extensionTypesCache) {
    const { extensionTypes } = await imports('@scripts/extensions');
    extensionTypesCache = extensionTypes;
  }

  if (extensionTypesCache[externalId]) {
    return extensionTypesCache[externalId];
  }

  const id = Object.keys(extensionTypesCache).find(
    (id) =>
      id === externalId ||
      (id.startsWith('third-party') && id.endsWith(externalId)),
  );
  return id ? extensionTypesCache[id] : '';
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

    return (await response.json()) as ExtensionInfo['version'];
  } catch {
    return undefined;
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
  elem: JQuery<Element> | null;
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
  return knownNamesCache.get(knownNames)!;
}

const INTERACTIVE_SELECTOR =
  'input, select, textarea, button, a, label' as const;

interface JQueryDOMElement extends JQuery<Element> {
  prevObject?: JQuery<HTMLElement>;
}

function* extensionProcessorGenerator(
  elements: JQuery<Element>[],
  knownNamesSet: Set<string> | null,
): Generator<null | ExtensionRecord, void, unknown> {
  const batchSize = 10;
  let processedCount = 0;

  for (let i = 0; i < elements.length; i++) {
    let element = elements[i] as JQueryDOMElement;

    if (element.length > 0 && element[0]?.childNodes.length === 0) {
      if (element.prevObject && element.prevObject.length > 0) {
        element = element.prevObject.clone(true, true);
      }
    }

    const content = element.find('.inline-drawer-content');
    if (content.length === 0) continue;

    const result = (() => {
      const directOwner = getOwner(element.get(0)!);
      if (directOwner) return { elem: content, owner: directOwner };

      const contentOwner = getOwner(content);
      if (contentOwner) return { elem: content, owner: contentOwner };

      const nativeContent = content.get(0);
      if (!nativeContent) return { elem: content, owner: 'unknown' };

      const interactives = nativeContent.querySelectorAll(INTERACTIVE_SELECTOR);
      if (interactives.length === 0) return { elem: content, owner: 'unknown' };

      const heuristics = new Map<string, number>();
      let maxCount = 0;
      let probableOwner = 'unknown';

      for (let j = 0; j < interactives.length; j++) {
        const owner = getOwner(interactives[j] as Element);
        if (!owner) continue;

        const count = (heuristics.get(owner) ?? 0) + 1;
        heuristics.set(owner, count);

        if (count > maxCount) {
          maxCount = count;
          probableOwner = owner;
        }
      }

      if (
        knownNamesSet &&
        probableOwner !== 'unknown' &&
        !knownNamesSet.has(probableOwner)
      ) {
        dislog.debug(`Skipping unknown extension: ${probableOwner}`);
        return { elem: null, owner: probableOwner };
      }

      return { elem: content, owner: probableOwner };
    })();

    if (result.elem) {
      result.elem.removeClass('inline-drawer-content');
      yield { name: result.owner, elem: result.elem };
    }

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
  const elements = window.discordia?.extensionTemplates || [];

  if (elements.length === 0) return [];

  const knownNamesSet = getKnownNamesSet(knownNames);

  const generator = extensionProcessorGenerator(elements, knownNamesSet);

  return runTaskInIdle(generator, signal);
}
