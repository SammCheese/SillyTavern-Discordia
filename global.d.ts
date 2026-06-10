export {};

import type {
  DiscordiaAPIv1,
  DiscordiaAPIVersionRange,
} from './src/apis/extensionAPI';

import type * as Scripts from './types/script-map';
import type * as SillyScript from '../../../../script';

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
  type ScriptKeys = keyof typeof Scripts;
  function imports(mod: '@script'): Promise<typeof SillyScript>;
  function imports<K extends ScriptKeys>(
    mod: `@scripts/${K}`,
  ): Promise<(typeof Scripts)[K]>;

  var dislog: Dislog;

  interface Window {
    discordia: {
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
