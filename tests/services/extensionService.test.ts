import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getManifests,
  type Manifest,
} from '../../src/services/extensionService';

describe('getManifests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns manifests for all successful extension requests', async () => {
    const firstManifest: Manifest = {
      display_name: 'Ext One',
      loading_order: 0,
      requires: [],
      optional: [],
      js: 'dist/bundle.js',
      css: 'dist/style.css',
      author: 'Author',
      version: '1.0.0',
      homePage: 'https://example.com/one',
      auto_update: true,
    };

    const secondManifest: Manifest = {
      ...firstManifest,
      display_name: 'Ext Two',
      version: '2.0.0',
      homePage: 'https://example.com/two',
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(firstManifest),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(secondManifest),
      });

    vi.stubGlobal('fetch', fetchMock);

    const result = await getManifests([
      'third-party/ExtOne',
      'third-party/ExtTwo',
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result['third-party/ExtOne']).toEqual(firstManifest);
    expect(result['third-party/ExtTwo']).toEqual(secondManifest);
  });

  it('omits entries when response is not ok', async () => {
    const manifest: Manifest = {
      display_name: 'Good Ext',
      loading_order: 0,
      requires: [],
      optional: [],
      js: 'dist/bundle.js',
      css: 'dist/style.css',
      author: 'Author',
      version: '1.2.3',
      homePage: 'https://example.com/good',
      auto_update: true,
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(manifest),
      });

    vi.stubGlobal('fetch', fetchMock);

    const result = await getManifests([
      'third-party/BadExt',
      'third-party/GoodExt',
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result['third-party/BadExt']).toBeUndefined();
    expect(result['third-party/GoodExt']).toEqual(manifest);
  });

  it('returns an empty object when all requests reject', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('network fail'))
      .mockRejectedValueOnce(new Error('network fail'));

    vi.stubGlobal('fetch', fetchMock);

    const result = await getManifests(['third-party/A', 'third-party/B']);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({});
  });
});
