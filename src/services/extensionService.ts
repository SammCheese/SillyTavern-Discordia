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


export async function getManifests(names: string[]): Promise<Record<string, Manifest>> {
    const obj: Record<string, Manifest> = {};
    const promises: Promise<Manifest>[] = [];

    for (const name of names) {
        const promise: Promise<Manifest> = new Promise((resolve, reject) => {
            fetch(`/scripts/extensions/${name}/manifest.json`).then(async response => {
                if (response.ok) {
                    const json = await response.json();
                    obj[name] = json;
                    resolve(json);
                } else {
                    reject();
                }
            }).catch(err => {
                reject();
                console.log('Could not load manifest.json for ' + name, err);
            });
        });

        promises.push(promise);
    }

    await Promise.allSettled(promises);
    return obj;
}
