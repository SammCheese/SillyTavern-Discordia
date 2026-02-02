/* eslint-disable @typescript-eslint/no-explicit-any */
const LoggerPrefix = '[Discordia]';
const StylePrefix =
  'color: #7289da; font-weight: bold; background: #E5EEFF; padding: 2px 4px; border-radius: 6px; border: 1px solid #ccc;';

function log(...args: any[]) {
  console.log(`%c${LoggerPrefix}`, StylePrefix, ...args);
}

function warn(...args: any[]) {
  console.warn(`%c${LoggerPrefix}`, StylePrefix, ...args);
}

function error(...args: any[]) {
  console.error(`%c${LoggerPrefix}`, StylePrefix, ...args);
}

function important(...args: any[]) {
  console.log(
    `%c${LoggerPrefix}%c IMPORTANT`,
    StylePrefix,
    'color: #ffffff; font-weight: bold; background: #ff0000; padding: 2px 4px; border-radius: 6px; border: 1px solid #ccc;',
    ...args,
  );
}

function debug(...args: any[]) {
  console.debug(`%c${LoggerPrefix}`, StylePrefix, ...args);
}

export const dislog = {
  log,
  warn,
  error,
  important,
  debug,
};
