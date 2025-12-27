import type { ExtensionInfo } from "../ExtensionSettings";

export async function discoverExtensions(): Promise<ExtensionInfo[]> {
  try {
    const response = await fetch('/api/extensions/discover');

    if (response.ok) {
      const extensions = await response.json();
      return extensions;
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
  }
}
