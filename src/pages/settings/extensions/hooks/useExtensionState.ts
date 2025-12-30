import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  discoverExtensions,
  processExtensionHTMLs,
  getExtensionVersion,
  type ExtensionRecord,
} from '../service/extensionService';
import type { ExtensionInfo, ExtensionList } from '../ExtensionSettings';
import { getManifests } from '../../../../services/extensionService';
import { DISCORDIA_EVENTS } from '../../../../events/eventTypes';

const { enableExtension, disableExtension } = await imports(
  '@scripts/extensions',
);
const { saveSettingsDebounced, eventSource } = await imports('@script');

const createSettingsMap = (
  records: ExtensionRecord[],
): Map<string, JQuery<HTMLElement> | null> => {
  const map = new Map<string, JQuery<HTMLElement> | null>();
  for (const record of records) {
    map.set(record.name, record.elem);
  }
  return map;
};

const normalizeExtensionName = (name: string): string =>
  name.replace('third-party/', '');

const sortExtensions = (extensions: ExtensionInfo[]): ExtensionInfo[] => {
  return extensions.sort((a, b) => {
    // Disabled extensions go to the end
    if (a.disabled !== b.disabled) {
      return a.disabled ? 1 : -1;
    }

    // Sort by existence of settings
    const aHasSettings = !!a.settings;
    const bHasSettings = !!b.settings;

    if (aHasSettings !== bHasSettings) {
      return aHasSettings ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });
};

export const useExtensionState = () => {
  const [settingsRecord, setSettingsRecord] = useState<
    ExtensionRecord[] | null
  >(null);
  const [extensions, setExtensions] = useState<ExtensionInfo[]>([]);
  const [categorizedExtensions, setCategorizedExtensions] =
    useState<ExtensionList>({
      local: [],
      global: [],
      system: [],
    });
  const [disabledExtensions, setDisabledExtensions] = useState<string[]>([]);

  useEffect(() => {
    const fetchDisabledExtensions = async () => {
      const { extension_settings } = await imports('@scripts/extensions');
      setDisabledExtensions(extension_settings.disabledExtensions);
    };

    fetchDisabledExtensions();
  }, []);

  useEffect(() => {
    saveSettingsDebounced();
  }, [disabledExtensions]);

  useEffect(() => {
    const fetchExtensions = async () => {
      const exts = await discoverExtensions();
      const manifests = await getManifests(exts.map((ext) => ext.name));

      const enrichedExts = exts.map((ext) => ({
        ...ext,
        manifest: manifests[ext.name],
        version: undefined,
      }));

      setExtensions(enrichedExts);
    };

    fetchExtensions();
  }, []);

  const versionUpdateTrigger = useMemo(() => {
    return extensions
      .filter((ext) => ext.type !== 'system')
      .map((ext) =>
        [
          ext.name,
          ext.type,
          ext.version?.currentCommitHash ?? '',
          ext.version?.currentBranchName ?? '',
          String(ext.version?.isUpToDate ?? ''),
        ].join(':'),
      )
      .join('|');
  }, [extensions]);

  useEffect(() => {
    const updateVersions = async () => {
      if (extensions.length === 0) return;

      // exclude system extensions
      const nonSystemExtensions = extensions.filter(
        (ext) => ext.type !== 'system',
      );

      const versionUpdates = await Promise.allSettled(
        nonSystemExtensions.map(async (ext) => {
          try {
            const versionData = await getExtensionVersion(ext.name);
            return { name: ext.name, version: versionData };
          } catch (error) {
            console.warn(`Failed to fetch version for ${ext.name}:`, error);
            return { name: ext.name, version: null };
          }
        }),
      );

      setExtensions((prev) =>
        prev.map((ext) => {
          if (ext.type === 'system') {
            return ext;
          }

          const update = versionUpdates.find(
            (result) =>
              result.status === 'fulfilled' && result.value.name === ext.name,
          );
          if (update && update.status === 'fulfilled') {
            return { ...ext, version: update.value.version };
          }
          return ext;
        }),
      );
    };

    updateVersions();
  }, [versionUpdateTrigger]);


  useEffect(() => {
    const controller = new AbortController();

    const fetchSettingsRecords = async (override = false) => {
      if (settingsRecord && settingsRecord.length > 0 && !override) return;
      try {
        const associations = await processExtensionHTMLs(
          undefined, controller.signal
        );
        setSettingsRecord(associations);

      } catch (error) {
        if ((error as DOMException).name === 'AbortError') {
          console.log('Fetch extension settings aborted');
        } else {
          console.error('Failed to fetch extension settings:', error);
        }
      }
    };

    const handlePopulated = () => fetchSettingsRecords(true);

    fetchSettingsRecords();

    eventSource.on(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED, handlePopulated);

    return () => {
      controller.abort();
      eventSource.removeListener(
        DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED,
        handlePopulated,
      );
    };
  }, []);

  const settingsMap = useMemo(() => {
    return settingsRecord ? createSettingsMap(settingsRecord) : null;
  }, [settingsRecord]);

  const extensionsWithSettings = useMemo(() => {
    if (!settingsMap) return extensions;

    return extensions.map((ext) => ({
      ...ext,
      settings: settingsMap.get(normalizeExtensionName(ext.name)) || null,
    }));
  }, [extensions, settingsMap]);

  useEffect(() => {
    const recategorized: ExtensionList = {
      local: [],
      global: [],
      system: [],
    };

    for (const ext of extensionsWithSettings) {
      const bucketType = (
        ext.type in recategorized ? ext.type : 'local'
      ) as keyof ExtensionList;

      recategorized[bucketType].push({
        ...ext,
        type: bucketType,
        disabled: disabledExtensions.includes(ext.name),
      });
    }

    recategorized.local = sortExtensions(recategorized.local);
    recategorized.global = sortExtensions(recategorized.global);
    recategorized.system = sortExtensions(recategorized.system);

    setCategorizedExtensions(recategorized);
  }, [extensionsWithSettings, disabledExtensions]);

  const toggleExtension = useCallback(async (extension: ExtensionInfo) => {
    try {
      if (extension.disabled) {
        await enableExtension(extension.name, false);
        setDisabledExtensions((prev) =>
          prev.filter((name) => name !== extension.name),
        );
      } else {
        await disableExtension(extension.name, false);
        setDisabledExtensions((prev) => [...prev, extension.name]);
      }
    } catch (error) {
      console.error('Failed to toggle extension:', error);
      throw error;
    }
  }, []);

  return {
    settingsRecord,
    extensions: extensionsWithSettings,
    disabledExtensions,
    toggleExtension,
    categorizedExtensions,
  };
};
