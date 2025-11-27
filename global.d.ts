export { };

declare module "*.css";
declare module "*.scss";

import * as importFunc from './utils/import';

import type * as Scripts from './types/script-map';
import type * as SillyScript from '../../../../script';

declare global {
  type ScriptKeys = keyof typeof Scripts;
  function imports<K extends ScriptKeys>(mod: `@scripts/${K}`): Promise<typeof Scripts[K]>;
  function imports(mod: '@script'): Promise<typeof SillyScript>;
  function imports(mod: string): Promise<typeof importFunc.default>;
}

