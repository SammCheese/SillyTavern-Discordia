/* eslint-disable @typescript-eslint/no-explicit-any */
import type { STModules } from './types/st-modules';

let isLocalCache = false;
let stRootCache = '/';
let pathsInitialized = false;

// Convert the '@scripts/scriptName' into the file path.
const resolveExpectedFileName = (mod: string): string => {
  if (mod === '@script') return '../script.js';

  if (mod.startsWith('@scripts/')) {
    let name = mod.slice(9); // remove '@scripts/'

    // map irregular names
    const irregularities: Record<string, string> = {
      textGenSettings: 'textgen-settings.js',
      rossMods: 'RossAscends-mods.js',
      samplerSelect: 'samplerSelect.js',
    };

    if (irregularities[name]) return irregularities[name]!;

    // convert to script name (e.g. groupChats -> group-chats.js)
    name = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

    if (!name.endsWith('.js')) name += '.js';
    return name;
  }

  return mod;
};

// The dots in the paths are relative to the location of the dist folder
// So we put this import into the top-level src folder to match the relative paths
const getPath = (mod: string, isLocal: boolean, stRoot: string): string => {
  if (isLocal) {
    // Special cast for e.g. ../script.js
    if (mod.startsWith('../')) {
      return `../../../../../../public/${mod.slice(3)}`;
    }
    return `../../../../../../public/scripts/${mod}`;
  }

  if (mod.startsWith('../')) {
    return stRoot + mod.slice(3);
  }
  return stRoot + 'scripts/' + mod;
};

const initializePaths = async () => {
  if (pathsInitialized) return;

  const url = new URL(import.meta.url);
  const scriptsIndex = url.pathname.indexOf('/scripts/');
  isLocalCache = scriptsIndex === -1;
  stRootCache = '/';

  if (!isLocalCache) {
    stRootCache = url.pathname.substring(0, scriptsIndex + 1);
  } else {
    try {
      const testPath = `../../../../../../script.js`;
      const testImport = await import(/* @vite-ignore */ testPath);

      if (testImport && Object.keys(testImport).length > 0) {
        isLocalCache = false;
        stRootCache = new URL('../../../../../../', url.href).pathname;
      }
    } catch {
      isLocalCache = true;
    }
  }

  pathsInitialized = true;
  dislog.important(
    `Running as ${isLocalCache ? 'local' : 'global'} extension.`,
  );
};

export async function imports<K extends keyof STModules>(
  mod: K,
): Promise<STModules[K]>;
export async function imports<T = any>(
  mod: string & Record<never, never>,
): Promise<T>;
export async function imports(mod: string): Promise<any> {
  if (!pathsInitialized) {
    await initializePaths();
  }

  try {
    const fileName = resolveExpectedFileName(mod);
    const resolvedPath = getPath(fileName, isLocalCache, stRootCache);

    const res = await import(/* @vite-ignore */ resolvedPath);
    return res;
  } catch (error) {
    const fileName = resolveExpectedFileName(mod);
    const resolvedPath = getPath(fileName, isLocalCache, stRootCache);
    dislog.error(`Error importing ${mod} (${resolvedPath}):`, error);
    return {};
  }
}

export default imports;
