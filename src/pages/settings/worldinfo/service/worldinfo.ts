const { getRequestHeaders } = await imports('@script');

export async function getSettings(): Promise<unknown> {
  try {
    const response = await fetch('/api/settings/get', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({}),
        cache: 'no-cache',
    });

    if (response.ok) {
      const settings = await response.json();
      return settings;
    } else {
      return {};
    }
  } catch (err) {
    console.error(err);
    return {};
  }
}

export async function getAllWorldInfos() {
  const { world_names } = await imports("@scripts/worldInfo")
  return world_names;
}
