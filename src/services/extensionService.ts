export interface Manifest {
  display_name: string;
  loading_order: number;
  requires: string[];
  optional: string[];
  js: string;
  css: string;
  author: string;
  version: string;
  homePage: string;
  auto_update: boolean;
}

const manifestCache = new Map<string, Manifest>();

export const invalidateManifestCache = (name?: string) => {
  if (name) {
    manifestCache.delete(name);
  } else {
    manifestCache.clear();
  }
};

export async function getManifests(
  names: string[],
): Promise<Record<string, Manifest>> {
  const obj: Record<string, Manifest> = {};
  const promises: Promise<Manifest>[] = [];

  for (const name of names) {
    if (manifestCache.has(name)) {
      obj[name] = manifestCache.get(name)!;
      continue;
    }

    const promise = new Promise<Manifest>((resolve, reject) => {
      fetch(`/scripts/extensions/${name}/manifest.json`)
        .then(async (response) => {
          if (response.ok) {
            const json = await response.json();
            manifestCache.set(name, json); // Cache it
            obj[name] = json;
            resolve(json);
          } else reject();
        })
        .catch((err) => {
          reject();
          dislog.warn('Could not load manifest.json for ' + name, err);
        });
    });
    promises.push(promise);
  }

  await Promise.allSettled(promises);
  return obj;
}
