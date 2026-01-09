import { runTaskInIdle } from '../../../../utils/utils';
import { getOwner } from '../../../../patches/settingsHijack';
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
    return data as ExtensionInfo['version'];
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
  return knownNamesCache.get(knownNames) || null;
}

const INTERACTIVE_SELECTOR =
  'input, select, textarea, button, a, label' as const;

function* extensionProcessorGenerator(
  elements: JQuery<Element>[],
  knownNamesSet: Set<string> | null,
): Generator<null | ExtensionRecord, void, unknown> {
  const batchSize = 5;
  let processedCount = 0;

  for (const element of elements) {
    const content = element.find('.inline-drawer-content');

    if (content.length === 0) continue;

    const { elem, owner } = (() => {
      const directOwner = getOwner(element as JQuery<HTMLElement>);
      if (directOwner) return { elem: content, owner: directOwner };

      const contentOwner = getOwner(content);
      if (contentOwner) return { elem: content, owner: contentOwner };

      const interactives = content.find(INTERACTIVE_SELECTOR);
      if (interactives.length === 0) return { elem: content, owner: 'unknown' };

      const heuristics = new Map<string, number>();
      let maxCount = 0;
      let probableOwner = 'unknown';

      interactives.each((_: number, interactive: HTMLElement) => {
        const owner = getOwner($(interactive));
        if (!owner) return;

        const count = (heuristics.get(owner) ?? 0) + 1;
        heuristics.set(owner, count);

        if (count > maxCount) {
          maxCount = count;
          probableOwner = owner;
        }
      });

      if (
        knownNamesSet &&
        probableOwner !== 'unknown' &&
        !knownNamesSet.has(probableOwner)
      ) {
        console.debug(
          `[Discordia] Skipping unknown extension: ${probableOwner}`,
        );
        return { elem: null, owner: probableOwner };
      }

      return { elem: content, owner: probableOwner };
    })();

    if (elem) {
      elem.removeClass('inline-drawer-content');
    }

    yield { name: owner, elem };

    processedCount++;
    if (processedCount % batchSize === 0) {
      yield null;
    }
  }
}

interface JQueryDOMElement extends JQuery<Element> {
  prevObject?: JQuery<HTMLElement>;
}

export async function processExtensionHTMLs(
  knownNames?: string[],
  signal?: AbortSignal,
): Promise<ExtensionRecord[]> {
  const elements = window.discordia?.extensionTemplates || [];

  if (elements.length === 0) return [];

  // Mobile Fix
  const validElements = elements.map((el: JQueryDOMElement) => {
    if (
      el.length > 0 &&
      el[0]?.childNodes.length === 0 &&
      el?.prevObject &&
      el?.prevObject.length > 0
    ) {
      console.debug('[Discordia] Mitigating dead element', el);
      return el.prevObject.clone(true, true);
    }
    return el;
  });

  const knownNamesSet = getKnownNamesSet(knownNames);

  const generator = extensionProcessorGenerator(validElements, knownNamesSet);

  return runTaskInIdle(generator, signal);
}
