/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

declare module '*.css';
declare module '*.scss';

import * as importFunc from './utils/import';

import type * as Scripts from './types/script-map';
import type * as SillyScript from '../../../../script';

type Dislog = {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  important: (...args: any[]) => void;
  custom: (heading: string, ...args: any[]) => void;
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
    };
  }
  const toastr: {
    success: (message: string, title?: string, options?: any) => void;
    error: (message: string, title?: string, options?: any) => void;
    warning: (message: string, title?: string, options?: any) => void;
    info: (message: string, title?: string, options?: any) => void;
  };
}

declare module '*.webm' {
  const src: string;
}
