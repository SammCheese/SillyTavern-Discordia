/**
 * Discordia's boundary to SillyTavern's bundled third-party libraries
 * (`public/lib.js`). These are upstream couplings that can break on ST
 * updates — add new library exports here instead of importing lib.js at
 * call sites.
 */
type Morphdom = (
  from: Node,
  to: Node | string,
  options?: Record<string, unknown>,
) => Node;

const mod = (await imports('../lib.js')) as { morphdom: Morphdom };

/** Live module namespace. */
export const libModule = mod;

/**
 * In-place DOM reconciler ST bundles and itself uses for streamed messages
 * (see scripts/util/stream-fadein.js). `to` may be a Node or an HTML string.
 */
export const morphdom: Morphdom = mod.morphdom;
