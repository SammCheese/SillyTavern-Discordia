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
}

declare module '*.webm' {
  const src: string;
}
