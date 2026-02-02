/* eslint-disable @typescript-eslint/no-explicit-any */

let PATH_MAP: Record<string, string> | null = null;
let pathsInitialized = false;

// The dots in the paths are relative to the location of the dist folder
// So we put this import into the top-level src folder to match the relative paths

const getPath = (mod: string, isLocal: boolean): string => {
  if (isLocal) {
    // Special cast for e.g. ../script.js
    if (mod.startsWith('../')) {
      return `../../../../../public/${mod.slice(3)}`;
    }
    return `../../../../../public/scripts/${mod}`;
  }
  return `../../../../${mod}`;
};

const initializePaths = async () => {
  if (pathsInitialized) return;

  let isLocal = false;

  try {
    const testPath = `../../../../../script.js`;
    const testImport = await import(/* webpackIgnore: true */ testPath);

    if (!testImport && !Object.keys(testImport).length) {
      isLocal = true;
    }
  } catch {
    isLocal = true;
  }

  PATH_MAP = {
    '@script': getPath('../script.js', isLocal),
    '@scripts/groupChats': getPath('group-chats.js', isLocal),
    '@scripts/utils': getPath('utils.js', isLocal),
    '@scripts/welcomeScreen': getPath('welcome-screen.js', isLocal),
    '@scripts/personas': getPath('personas.js', isLocal),
    '@scripts/chats': getPath('chats.js', isLocal),
    '@scripts/powerUser': getPath('power-user.js', isLocal),
    '@scripts/extensions': getPath('extensions.js', isLocal),
    '@scripts/worldInfo': getPath('world-info.js', isLocal),
    '@scripts/naiSettings': getPath('nai-settings.js', isLocal),
    '@scripts/openai': getPath('openai.js', isLocal),
    '@scripts/kaiSettings': getPath('kai-settings.js', isLocal),
    '@scripts/horde': getPath('horde.js', isLocal),
    '@scripts/textGenSettings': getPath('textgen-settings.js', isLocal),
    '@scripts/presetManager': getPath('preset-manager.js', isLocal),
    '@scripts/secrets': getPath('secrets.js', isLocal),
  };

  pathsInitialized = true;
  dislog.important(`Running as ${isLocal ? 'local' : 'global'} extension.`);
};

export const imports = async <T = any>(mod: string): Promise<T> => {
  if (!pathsInitialized || PATH_MAP === null) {
    await initializePaths();
  }

  try {
    const resolvedPath = PATH_MAP![mod] || mod;
    const res = await import(/* webpackIgnore: true */ resolvedPath);
    return res as T;
  } catch (error) {
    dislog.error(`Error importing ${mod} (${PATH_MAP![mod]}):`, error);
    return {} as T;
  }
};
