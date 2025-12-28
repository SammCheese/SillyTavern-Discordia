import { useEffect, useState, useMemo } from 'react';
import {
  discoverExtensions,
  processExtensionHTMLs,
  type ExtensionRecord,
} from '../service/extensionService';
import type { ExtensionInfo, ExtensionList } from '../ExtensionSettings';
import { DISCORDIA_EVENTS } from '../../../../events/eventTypes';

const { enableExtension, disableExtension } = await imports(
  '@scripts/extensions',
);
const { saveSettingsDebounced, eventSource } = await imports('@script');

export const useExtensionState = () => {
  const [settingsRecord, setSettingsRecord] = useState<ExtensionRecord[] | null>(
    null,
  );
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

      const disabled = extension_settings.disabledExtensions;
      setDisabledExtensions(disabled);
    };

    fetchDisabledExtensions();
  }, []);

  useEffect(() => {
    saveSettingsDebounced();
  }, [disabledExtensions]);

  useEffect(() => {
    const fetchExtensions = async () => {
      const exts = await discoverExtensions();
      setExtensions(exts);
    };

    fetchExtensions();
  }, []);


  const extensionsWithSettings = useMemo(() => {
    if (!settingsRecord || settingsRecord.length === 0) {
      return extensions;
    }

    return extensions.map((ext) => {
      const settings = settingsRecord.find(
        (record) => ext.name.replace('third-party/', '') === record.name,
      )?.elem;
      return settings ? { ...ext, settings } : ext;
    });
  }, [extensions, settingsRecord]);

  useEffect(() => {
    const recategorizedExtensions: ExtensionList = {
      local: [],
      global: [],
      system: [],
    };

    extensionsWithSettings.forEach((ext) => {
      const bucketType =
        ext.type in recategorizedExtensions
          ? (ext.type as keyof ExtensionList)
          : 'local';

      recategorizedExtensions[bucketType].push({
        ...ext,
        type: bucketType,
        settings: ext.settings,
        disabled: disabledExtensions.includes(ext.name),
      });
    });

    setCategorizedExtensions(recategorizedExtensions);
  }, [extensionsWithSettings, disabledExtensions]);

  useEffect(() => {
    const fetchSettingsRecord = async () => {
      const associations = await processExtensionHTMLs();
      setSettingsRecord(associations);
    };

    eventSource.on(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED, fetchSettingsRecord);
    // Process any existing templates on mount
    fetchSettingsRecord();

    return () => {
      eventSource.removeListener(
        DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED,
        fetchSettingsRecord,
      );
    };
  }, []);


  const toggleExtension = async (extension: ExtensionInfo) => {
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
  };

  return {
    settingsRecord,
    extensions: extensionsWithSettings,
    disabledExtensions,
    toggleExtension,
    categorizedExtensions,
  };
};
