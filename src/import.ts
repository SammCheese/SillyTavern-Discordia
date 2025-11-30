/* eslint-disable @typescript-eslint/no-explicit-any */

// The dots in the paths are relative to the location of the dist folder
// So we put this import into the top-level src folder to match the relative paths
const PATH_MAP: Record<string, string> = {
  '@script': "../../../../../script.js",
  '@scripts/groupChats': '../../../../group-chats.js',
  '@scripts/utils': '../../../../utils.js',
  '@scripts/welcomeScreen': '../../../../welcome-screen.js',
  '@scripts/personas': '../../../../personas.js',
  '@scripts/chats': '../../../../chats.js',
  '@scripts/powerUser': '../../../../power-user.js',
  '@scripts/extensions': '../../../../extensions.js',
  '@scripts/worldInfo': '../../../../world-info.js',
};

export const  imports = async <T = any>(mod: string): Promise<T> => {
  try {
    const resolvedPath = PATH_MAP[mod] || mod;
    const res = await import( /* webpackIgnore: true */ resolvedPath);
    return res as T;
  } catch (error) {
    console.error(`Error importing ${mod} (${PATH_MAP[mod]}):`, error);
    return {} as T;
  }
};
