const { getRequestHeaders, getCharacters } = await imports('@script');

export async function saveGroup(group, reload = true) {
  await fetch('/api/groups/edit', {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify(group),
  });
  if (reload) {
    await getCharacters();
  }
}
