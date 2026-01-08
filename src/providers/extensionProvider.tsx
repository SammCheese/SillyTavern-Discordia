import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Version } from '../pages/settings/extensions/ExtensionSettings';
import { getManifests, type Manifest } from '../services/extensionService';
import {
  discoverExtensions,
  getExtensionVersion,
  processExtensionHTMLs,
} from '../pages/settings/extensions/service/extensionService';
import { DISCORDIA_EVENTS } from '../events/eventTypes';

const { enableExtension, disableExtension } = await imports(
  '@scripts/extensions',
);
const { saveSettingsDebounced, eventSource } = await imports('@script');

export interface ExtensionRecord {
  name: string;
  elem: JQuery<HTMLElement | Element> | HTMLElement | null;
}
export interface ExtensionInfo {
  name: string;
  type: string;
  disabled: boolean;
  manifest?: Manifest | undefined;
  settings?: JQuery<HTMLElement> | null | undefined;
  version?: Version | undefined;
}

export interface ExtensionList {
  local: ExtensionInfo[];
  global: ExtensionInfo[];
  system: ExtensionInfo[];
}

interface ExtensionContextType {
  extensions: ExtensionInfo[];
  categorizedExtensions: ExtensionList;
  disabledExtensions: string[];
  settingsRecord: ExtensionRecord[] | null;
  toggleExtension: (ext: ExtensionInfo) => void;
  isLoading: boolean;
  refreshExtensions: () => void;
}

const normalizeExtensionName = (name: string): string =>
  name.replace('third-party/', '');

const sortExtensions = (extensions: ExtensionInfo[]) => {
  return [...extensions].sort((a, b) => {
    if (a.disabled !== b.disabled) return a.disabled ? 1 : -1;
    const aHasSettings = !!a.settings;
    const bHasSettings = !!b.settings;
    if (aHasSettings !== bHasSettings) return aHasSettings ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
};

const ExtensionContext = createContext<ExtensionContextType | null>(null);

export const ExtensionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [settingsRecord, setSettingsRecord] = useState<
    ExtensionRecord[] | null
  >(null);
  const [extensions, setExtensions] = useState<ExtensionInfo[]>([]);
  const [disabledExtensions, setDisabledExtensions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { extension_settings } = await imports('@scripts/extensions');
      setDisabledExtensions(extension_settings.disabledExtensions || []);
    };
    init();
  }, []);

  const isMounted = useRef(false);
  useEffect(() => {
    if (isMounted.current) {
      saveSettingsDebounced();
    }
    isMounted.current = true;
  }, [disabledExtensions]);

  const fetchBaseData = useCallback(async () => {
    setIsLoading(true);
    try {
      const exts = await discoverExtensions();
      const manifests = await getManifests(exts.map((ext) => ext.name));

      const enriched = exts.map((ext) => ({
        ...ext,
        manifest: manifests?.[ext.name],
        version: undefined,
      }));

      setExtensions(enriched);
    } catch (err) {
      console.error('Failed to load extensions', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBaseData();
  }, [fetchBaseData]);

  useEffect(() => {
    const targets = extensions.filter((e) => e.type !== 'system' && !e.version);
    if (targets.length === 0) return;

    const t = setTimeout(async () => {
      const updates = await Promise.allSettled(
        targets.map(async (ext) => {
          try {
            const ver = await getExtensionVersion(ext.name);
            return { name: ext.name, version: ver };
          } catch {
            return null;
          }
        }),
      );

      setExtensions((prev) =>
        prev.map((ext) => {
          const update = updates.find(
            (u) => u.status === 'fulfilled' && u.value?.name === ext.name,
          );
          if (update && update.status === 'fulfilled' && update.value) {
            return { ...ext, version: update.value.version };
          }
          return ext;
        }),
      );
    }, 100);
    return () => clearTimeout(t);
  }, [extensions]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const associations = await processExtensionHTMLs();
        setSettingsRecord((prev) => {
          if (!prev) return associations;
          const newMap = new Map(associations.map((a) => [a.name, a]));

          const merged = prev.map((p) => {
            if (newMap.has(p.name)) {
              const updated = newMap.get(p.name)!;
              newMap.delete(p.name);
              return updated;
            }
            return p;
          });
          return [...merged, ...newMap.values()];
        });
      } catch (e) {
        console.error(e);
      }
    };

    eventSource.on(DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED, fetchSettings);
    return () => {
      eventSource.removeListener(
        DISCORDIA_EVENTS.EXTENSION_HTML_POPULATED,
        fetchSettings,
      );
    };
  }, []);

  const settingsMap = useMemo(() => {
    if (!settingsRecord) return null;
    const map = new Map<
      string,
      JQuery<HTMLElement | Element> | HTMLElement | null
    >();
    for (const record of settingsRecord) {
      map.set(record.name, record.elem);
    }
    return map;
  }, [settingsRecord]);

  const mergedExtensions = useMemo(() => {
    return extensions.map((ext) => ({
      ...ext,
      settings: settingsMap
        ? settingsMap.get(normalizeExtensionName(ext.name)) || null
        : null,
    }));
  }, [extensions, settingsMap]);

  const categorizedExtensions = useMemo(() => {
    const list: ExtensionList = { local: [], global: [], system: [] };

    for (const ext of mergedExtensions) {
      const type = (
        ext.type in list ? ext.type : 'local'
      ) as keyof ExtensionList;
      list[type].push({
        ...ext,
        disabled: disabledExtensions.includes(ext.name),
      } as ExtensionInfo);
    }

    list.local = sortExtensions(list.local);
    list.global = sortExtensions(list.global);
    list.system = sortExtensions(list.system);

    return list;
  }, [mergedExtensions, disabledExtensions]);

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

  const refreshExtensions = useCallback(() => {
    fetchBaseData();
  }, [fetchBaseData]);

  const contextValue = useMemo(
    () => ({
      extensions,
      categorizedExtensions,
      disabledExtensions,
      settingsRecord,
      toggleExtension,
      isLoading,
      refreshExtensions,
    }),
    [
      extensions,
      categorizedExtensions,
      disabledExtensions,
      settingsRecord,
      toggleExtension,
      isLoading,
      refreshExtensions,
    ],
  );

  return (
    <ExtensionContext.Provider value={contextValue}>
      {children}
    </ExtensionContext.Provider>
  );
};

export const useExtensionState = (): ExtensionContextType => {
  const context = useContext(ExtensionContext);
  if (!context) {
    throw new Error(
      'useExtensionState must be used within an ExtensionProvider',
    );
  }
  return context;
};
