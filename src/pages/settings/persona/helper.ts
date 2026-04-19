const { getRequestHeaders, getThumbnailUrl, saveSettingsDebounced } =
  await imports('@script');
const { ensureImageFormatSupported } = await imports('@scripts/utils');
const { getUserAvatar, getUserAvatars } = await imports('@scripts/personas');

export const deletePersona = (avatarName: string) => {
  const context = SillyTavern.getContext();
  SillyTavern.getContext().powerUserSettings.personas = Object.fromEntries(
    Object.entries(context.powerUserSettings.personas ?? {}).filter(
      ([avatar]) => avatar !== avatarName,
    ),
  );
  SillyTavern.getContext().powerUserSettings.persona_descriptions =
    Object.fromEntries(
      Object.entries(
        context.powerUserSettings.persona_descriptions ?? {},
      ).filter(([avatar]) => avatar !== avatarName),
    );

  saveSettingsDebounced();
};

export const createPersona = (persona: FullPersona) => {
  const context = SillyTavern.getContext();
  const newPersonas = {
    ...context.powerUserSettings.personas,
    [persona.avatar]: persona.name,
  };
  const newDescriptions = {
    ...context.powerUserSettings.persona_descriptions,
    [persona.avatar]: {
      depth: persona.depth,
      description: persona.description,
      lorebook: persona.lorebook,
      position: persona.position,
      role: persona.role,
      title: persona.title,
    },
  };

  SillyTavern.getContext().powerUserSettings.personas = newPersonas;
  SillyTavern.getContext().powerUserSettings.persona_descriptions =
    newDescriptions;

  saveSettingsDebounced();
};

export const renamePersona = (
  oldAvatar: string,
  newAvatar: string,
  newName: string,
) => {
  const context = SillyTavern.getContext();
  const personas = context.powerUserSettings.personas ?? {};
  const descriptions = context.powerUserSettings.persona_descriptions ?? {};

  if (oldAvatar !== newAvatar) {
    // Handle avatar rename
    if (personas[oldAvatar]) {
      personas[newAvatar] = newName;
      delete personas[oldAvatar];
    }
    if (descriptions[oldAvatar]) {
      descriptions[newAvatar] = descriptions[oldAvatar];
      delete descriptions[oldAvatar];
    }
  } else {
    // Handle name change only
    if (personas[oldAvatar]) {
      personas[oldAvatar] = newName;
    }
  }

  saveSettingsDebounced();
};

export const savePersonasData = (personas: FullPersona[]) => {
  const context = SillyTavern.getContext();
  const newPersonas: Record<string, string> = {};
  const newDescriptions: Record<
    string,
    {
      depth: number;
      description: string;
      lorebook: string;
      position: number;
      role: number;
      title: string;
    }
  > = {};

  personas.forEach((persona) => {
    newPersonas[persona.avatar] = persona.name;
    newDescriptions[persona.avatar] = {
      depth: persona.depth ?? 0,
      description: persona.description ?? '',
      lorebook: persona.lorebook ?? '',
      position: persona.position ?? 0,
      role: persona.role ?? 0,
      title: persona.title ?? '',
    };
  });

  context.powerUserSettings.personas = newPersonas;
  context.powerUserSettings.persona_descriptions = newDescriptions;

  saveSettingsDebounced();
};

export const updatePersonaAvatarImage = async (
  avatarName: string,
  rawFile: File,
) => {
  if (!avatarName || !(rawFile instanceof File)) {
    throw new Error('Invalid persona avatar update payload');
  }

  const file = await ensureImageFormatSupported(rawFile);
  const formData = new FormData();
  formData.append('avatar', file);
  formData.append('overwrite_name', avatarName);

  const response = await fetch('/api/avatars/upload', {
    method: 'POST',
    headers: getRequestHeaders({ omitContentType: true }),
    cache: 'no-cache',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload persona avatar: ${response.statusText}`);
  }

  const data = await response.json();
  const updatedAvatar = String(data?.path || avatarName);

  await fetch(getUserAvatar(updatedAvatar), { cache: 'reload' });
  await fetch(getThumbnailUrl('persona', updatedAvatar), { cache: 'reload' });
  await getUserAvatars(true, updatedAvatar);

  return updatedAvatar;
};

export const withCacheBust = (
  url: string,
  nonce: string | number | null | undefined,
) => {
  if (!url || nonce === null || nonce === undefined) {
    return url;
  }

  const hashIndex = url.indexOf('#');
  const baseUrl = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : '';
  const separator = baseUrl.includes('?') ? '&' : '?';

  return `${baseUrl}${separator}dc=${encodeURIComponent(String(nonce))}${hash}`;
};
