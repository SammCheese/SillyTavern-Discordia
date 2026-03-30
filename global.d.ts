export {};

import * as importFunc from './utils/import';

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
  function imports<K extends ScriptKeys>(
    mod: `@scripts/${K}`,
  ): Promise<(typeof Scripts)[K]>;
  function imports(mod: '@script'): Promise<typeof SillyScript>;
  function imports(mod: string): Promise<typeof importFunc.default>;

  var dislog: Dislog;

  interface Window {
    discordia: {
      extensionTemplates?: JQuery<Element>[];
      backups: {
        originalLoadSpinner?: JQuery<HTMLElement>;
      };
    };
  }
  const toastr: {
    success: (message: string, title?: string, options?: unknown) => void;
    error: (message: string, title?: string, options?: unknown) => void;
    warning: (message: string, title?: string, options?: unknown) => void;
    info: (message: string, title?: string, options?: unknown) => void;
  };
}
