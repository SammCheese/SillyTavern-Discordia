export {};

import type {
  DiscordiaAPIv1,
  DiscordiaAPIVersionRange,
} from './src/apis/extensionAPI';

import type { STModules } from './src/types/st-modules';

declare module '*.webm' {
  const src: string;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

type Dislog = {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  important: (...args: unknown[]) => void;
  custom: (heading: string, ...args: unknown[]) => void;
};

declare global {
  export async function imports<K extends keyof STModules>(
    mod: K,
  ): Promise<STModules[K]>;
  export async function imports<T = unknown>(
    mod: string & Record<never, never>,
  ): Promise<T>;

  var dislog: Dislog;

  interface Window {
    discordia: {
      __root?: import('react-dom/client').Root;
      extensionTemplates?: JQuery<Element>[];
      backups: {
        originalLoadSpinner?: JQuery<HTMLElement>;
      };
      api?: DiscordiaAPIv1;
      apis?: {
        v1?: DiscordiaAPIv1;
      };
      getApi?: (versionRange?: DiscordiaAPIVersionRange) => DiscordiaAPIv1;
      imports: typeof imports;
    };
  }
  const toastr: {
    success: (message: string, title?: string, options?: unknown) => void;
    error: (message: string, title?: string, options?: unknown) => void;
    warning: (message: string, title?: string, options?: unknown) => void;
    info: (message: string, title?: string, options?: unknown) => void;
  };
}
