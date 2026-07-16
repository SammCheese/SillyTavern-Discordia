import { createStore } from '../../../utils/store';
import { selectCharacter, selectGroup } from '../../../utils/utils';
import { characters } from '../../../st/script';

/**
 * Entity selection for the server bar, keyed by `${type}:${id}` instead of
 * list index — index-based selection breaks as soon as the visible list is
 * sorted or filtered differently from the source array.
 */
export type EntityKey = string;

export const entityKey = (entity: Entity): EntityKey =>
  `${entity.type}:${entity.id}`;

/** Selection state shared by every consumer (see utils/store). */
export const selectedEntityKeyStore = createStore<EntityKey | null>(null);

/** The entity ST itself considers active right now. */
export const getActiveEntityKey = (): EntityKey | null => {
  const { characterId, groupId } = SillyTavern.getContext();

  if (groupId !== null && typeof groupId !== 'undefined') {
    return `group:${groupId}`;
  }

  if (
    characterId !== null &&
    typeof characterId !== 'undefined' &&
    parseInt(characterId) >= 0
  ) {
    return `character:${characterId}`;
  }

  return null;
};

/** Dispatches the ST-side selection for a sidebar entity. */
export const openEntity = (entity: Entity): Promise<unknown> => {
  if (entity.type === 'group') {
    const groupId = entity.id.toString();
    const group = SillyTavern.getContext().groups.find(
      (g) => g.id.toString() === groupId,
    );
    if (!group) return Promise.resolve();

    return Promise.resolve(selectGroup({ group: entity }));
  }

  const charId = characters.findIndex((c) => c.avatar === entity.item?.avatar);
  if (charId === -1) return Promise.resolve();

  return Promise.resolve(selectCharacter(charId));
};

/**
 * Favorite flag lives either on the card data extensions or the top level,
 * depending on how the character was created/imported.
 */
export const isFavoriteEntity = (entity: Entity): boolean =>
  Boolean(entity.item?.data?.extensions?.fav ?? entity.item?.fav);

/** Case-insensitive name filter, then favorites-first (stable) sort. */
export const sortAndFilterEntities = (
  entities: Entity[],
  searchQuery: string,
  favoritesOnTop: boolean,
): Entity[] => {
  let result = entities;

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter((entity) =>
      (entity.item?.name || '').toLowerCase().includes(query),
    );
  }

  if (favoritesOnTop) {
    result = (result === entities ? [...entities] : result).sort(
      (a, b) => Number(isFavoriteEntity(b)) - Number(isFavoriteEntity(a)),
    );
  }

  return result;
};
