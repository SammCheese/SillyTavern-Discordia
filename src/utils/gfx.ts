const LOW_GFX_CLASS = 'discordia-low-gfx';

let cachedResult: boolean | null = null;

// GPU-composited effects (backdrop-filter, animated transforms) fall back to
// per-frame CPU rasterization
const SOFTWARE_RENDERER_REGEX =
  /swiftshader|llvmpipe|softpipe|software|basic render/i;

export const isSoftwareRenderer = (): boolean => {
  if (cachedResult !== null) return cachedResult;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false }) ??
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: false });

    if (!gl) {
      cachedResult = true;
      return cachedResult;
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : '';

    gl.getExtension('WEBGL_lose_context')?.loseContext();

    cachedResult = SOFTWARE_RENDERER_REGEX.test(renderer);

    if (cachedResult) {
      dislog.important(
        `Software rendering detected ("${renderer}"). Enabling low graphics mode.`,
      );
    }
  } catch (error) {
    dislog.warn('Failed to probe renderer, assuming hardware rendering', error);
    cachedResult = false;
  }

  return cachedResult;
};

export const applyLowGfxMode = () => {
  document.body.classList.toggle(LOW_GFX_CLASS, isSoftwareRenderer());
};

export const removeLowGfxMode = () => {
  document.body.classList.remove(LOW_GFX_CLASS);
};
