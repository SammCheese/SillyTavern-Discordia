export async function getWorldInfos(): Promise<unknown[]> {
  try {
    const response = await fetch('/api/worldinfo/list');

    if (response.ok) {
      const wi = await response.json();
      console.log(wi);
      return wi;
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
  }
}
