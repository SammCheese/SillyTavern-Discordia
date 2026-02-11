import { DISCORDIA_EVENTS } from '../events/eventTypes';

const {
  getRequestHeaders,
  getCharacters,
  eventSource,
  deleteCharacter,
  closeCurrentChat,
} = await imports('@script');
const { ensureImageFormatSupported } = await imports('@scripts/utils');

export interface CharacterPayload {
  ch_name: string;
  avatar: File | string;
  avatar_url?: string;

  description?: string;
  personality?: string;
  scenario?: string;
  first_mes?: string;
  mes_example?: string;

  creator_notes?: string;
  tags?: string[];
  talkativeness?: number | string;
  fav?: string;
  creator?: string;
  character_version?: string;

  system_prompt?: string;
  post_history_instructions?: string;
  alternate_greetings?: string[];
  world?: string;

  depth_prompt_prompt?: string;
  depth_prompt_depth?: number;
  depth_prompt_role?: string;

  extensions?: string;
}

export async function editCharacter(data: CharacterPayload): Promise<void> {
  const url = '/api/characters/edit';
  const formData = new FormData();

  if (data.avatar instanceof File) {
    const processed = await ensureImageFormatSupported(data.avatar);
    formData.append('avatar', processed);
  }

  const append = (key: keyof CharacterPayload) => {
    const value = data[key];
    if (value === undefined || value === null || key === 'avatar') return;

    if (Array.isArray(value)) {
      if (key === 'tags') {
        formData.append(key, value.join(','));
      } else {
        value.forEach((v) => formData.append(key, String(v)));
      }
    } else {
      formData.append(key, String(value));
    }
  };

  (Object.keys(data) as Array<keyof CharacterPayload>).forEach(append);

  const response = await fetch(url, {
    method: 'POST',
    headers: getRequestHeaders({ omitContentType: true }),
    body: formData,
    cache: 'no-cache',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function charToPayload(char: any): CharacterPayload {
  const getData = (key: string, fallbackKey?: string) => {
    if (char.data && char.data[key] !== undefined && char.data[key] !== '') {
      return char.data[key];
    }
    if (fallbackKey && char[fallbackKey] !== undefined) {
      return char[fallbackKey];
    }
    if (char[key] !== undefined) {
      return char[key];
    }
    return '';
  };

  const getExt = (key: string) => char.data?.extensions?.[key] ?? undefined;

  const depth = char.data?.extensions?.depth_prompt ?? {};

  const rawExtensions = { ...(char.data?.extensions || {}) };
  delete rawExtensions.depth_prompt;
  delete rawExtensions.talkativeness;
  delete rawExtensions.fav;
  delete rawExtensions.world;

  let tags = getData('tags');
  if (typeof tags === 'string') {
    tags = tags
      .split(',')
      .map((x: string) => x.trim())
      .filter((x: string) => x);
  } else if (!Array.isArray(tags)) {
    tags = [];
  }

  let alternateGreetings = getData('alternate_greetings');
  if (!Array.isArray(alternateGreetings)) {
    alternateGreetings = [];
  }

  const payload: CharacterPayload = {
    ch_name: getData('name') || char.name || '',
    avatar: char.avatar || 'none',

    description: getData('description'),
    personality: getData('personality'),
    scenario: getData('scenario'),
    first_mes: getData('first_mes'),
    mes_example: getData('mes_example'),

    creator_notes: getData('creator_notes', 'creatorcomment'),
    tags: tags,
    creator: getData('creator'),
    character_version: getData('character_version'),

    system_prompt: getData('system_prompt'),
    post_history_instructions: getData('post_history_instructions'),
    alternate_greetings: alternateGreetings,

    talkativeness: getExt('talkativeness') ?? char.talkativeness ?? 0.5,
    fav: String(getExt('fav') ?? char.fav ?? false),
    world: getExt('world') ?? char.world ?? '',
    depth_prompt_prompt: depth.prompt ?? '',
    depth_prompt_depth: !isNaN(Number(depth.depth)) ? Number(depth.depth) : 4,
    depth_prompt_role: depth.role ?? 'system',
  };

  if (Object.keys(rawExtensions).length > 0) {
    payload.extensions = JSON.stringify(rawExtensions);
  }

  return payload;
}

export async function renameCharacter(
  avatarUrl: string,
  newName: string,
): Promise<string> {
  if (!avatarUrl || !newName) {
    throw new Error(
      'Avatar URL and new name are required to rename character.',
    );
  }

  const url = '/api/characters/rename';

  const response = await fetch(url, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({ avatar_url: avatarUrl, new_name: newName }),
    cache: 'no-cache',
  });

  if (!response.ok) {
    throw new Error(`Failed to rename character: ${response.statusText}`);
  }

  // Returns the avatar url
  const res = await response.text();

  return res;
}

export async function createCharacter(
  payload: CharacterPayload,
): Promise<string> {
  const url = '/api/characters/create';
  const formData = new FormData();

  if (payload.avatar instanceof File) {
    const processed = await ensureImageFormatSupported(payload.avatar);
    const filename = (payload.avatar as File).name || 'avatar.png';
    formData.append('avatar', processed, filename);
  } else if (typeof payload.avatar === 'string') {
    formData.append('avatar_url', payload.avatar);
  }

  const append = (key: keyof CharacterPayload) => {
    const value = payload[key];
    if (value === undefined || value === null || key === 'avatar') return;

    if (Array.isArray(value)) {
      if (key === 'tags') {
        formData.append(key, value.join(','));
      } else {
        value.forEach((v) => formData.append(key, String(v)));
      }
    } else {
      formData.append(key, String(value));
    }
  };

  (Object.keys(payload) as Array<keyof CharacterPayload>).forEach(append);

  const response = await fetch(url, {
    method: 'POST',
    headers: getRequestHeaders({ omitContentType: true }),
    body: formData,
    cache: 'no-cache',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }

  // Returns the avatar url
  const res = await response.text();

  return res;
}

export async function _deleteCharacter(
  avatarUrl: string,
  options: { deleteChats?: boolean } = {},
): Promise<void> {
  if (!avatarUrl) {
    throw new Error('Avatar URL is required to delete character.');
  }

  const { characters, characterId } = SillyTavern.getContext();
  const character = characters.find((c) => c.avatar?.toString() === avatarUrl);
  const isCurrentCharacter =
    characterId !== null &&
    characterId !== undefined &&
    character &&
    characters[characterId] === character;

  // Close chat BEFORE deletion if this is the current character
  if (isCurrentCharacter) {
    await closeCurrentChat();
  }

  await deleteCharacter(avatarUrl, options);

  await refreshCharacterList();
}

export async function refreshCharacterList(): Promise<void> {
  await getCharacters();
  eventSource.emit(DISCORDIA_EVENTS.ENTITY_CHANGED);
}

export async function updateCharacter(
  originalAvatarId: string,
  payload: CharacterPayload,
): Promise<string> {
  const originalName = SillyTavern.getContext().characters.find(
    (c) => c.avatar?.toString() === originalAvatarId,
  )?.name;

  if (!originalName) {
    throw new Error('Original character not found for update.');
  }

  // We first edit the character, then rename if necessary
  const editPayload: CharacterPayload = {
    ...payload,
    avatar_url: originalAvatarId,
    ch_name: originalName,
  };

  await editCharacter(editPayload);

  if (payload.ch_name && payload.ch_name.trim() !== originalName) {
    try {
      return await renameCharacter(originalAvatarId, payload.ch_name.trim());
    } catch (error) {
      dislog.error('Edit successful, but Rename failed:', error);
      throw error;
    }
  }

  await getCharacters();

  return originalAvatarId;
}
