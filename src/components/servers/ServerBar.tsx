import { useCallback, useMemo, lazy, memo } from 'react';
import { List, type RowComponentProps } from 'react-window';
import { useSearch } from '../../providers/searchProvider';
import ErrorBoundary from '../common/ErrorBoundary/ErrorBoundary';
import { DISCORDIA_EVENTS } from '../../events/eventTypes';
import { useModal } from '../../providers/modalProvider';
import CharacterModal from '../../modals/Character/CharacterModal';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useSidebarData } from '../../providers/contentProviders/sidebarStateProvider';
import { useEntitySelection } from './hooks/useEntitySelection';
import {
  entityKey,
  isFavoriteEntity,
  sortAndFilterEntities,
} from './services/entitySelection';

import { closeCurrentChat, eventSource } from '../../st/script';
import CharacterLibraryButton from './Icons/CharacterLibraryButton';
import { useExtensionState } from '../../providers/contentProviders/extensionProvider';
import Tooltip from '../common/Tooltip/Tooltip';
import { useSettings } from '../../providers/discordiaSettingsProvider';

const ServerIcon = lazy(() => import('./Icons/ServerIcon'));
const AddCharacterIcon = lazy(() => import('./Icons/AddCharacterIcon'));
const HomeIcon = lazy(() => import('./Icons/HomeIcon'));

interface ServerRowProps {
  entity: Entity;
  isSelected: boolean;
  style?: React.CSSProperties;
  onClick: (entity: Entity) => void;
}

const ServerRow = memo(
  function ServerRow({ entity, isSelected, style, onClick }: ServerRowProps) {
    return (
      <div
        style={style}
        className="discord-entity-item character-button w-full h-fit flex justify-center py-1"
        id={`character-button-${entity.id}`}
      >
        <ServerIcon entity={entity} isSelected={isSelected} onClick={onClick} />
      </div>
    );
  },
  (prevProps, nextProps) => {
    const prevItem = prevProps.entity.item;
    const nextItem = nextProps.entity.item;
    return (
      (prevItem?.avatar ?? prevItem?.avatar_url) ===
        (nextItem?.avatar ?? nextItem?.avatar_url) &&
      prevItem?.name === nextItem?.name &&
      isFavoriteEntity(prevProps.entity) ===
        isFavoriteEntity(nextProps.entity) &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.onClick === nextProps.onClick
    );
  },
);

interface RowData {
  data: {
    entities: Entity[];
    selectedKey: string | null;
    onSelect: (entity: Entity) => void;
  };
}

const Row = ({ index, style, data }: RowComponentProps<RowData>) => {
  const { entities, selectedKey, onSelect } = data;
  const { openModal } = useModal();
  const entity = entities[index];

  const handleAddCharacterClick = useCallback(() => {
    openModal(<CharacterModal type="create" />);
  }, [openModal]);

  if (!entity) {
    return (
      <div
        style={style}
        className="discord-entity-item character-button w-full h-fit flex justify-center py-1"
      >
        <AddCharacterIcon onClick={handleAddCharacterClick} />
      </div>
    );
  }

  return (
    <ServerRow
      entity={entity}
      style={style}
      isSelected={selectedKey === entityKey(entity)}
      onClick={onSelect}
    />
  );
};

const ServerBar = () => {
  const { searchQuery } = useSearch();
  const { openModal } = useModal();
  const { entities, isInitialLoad } = useSidebarData();
  const { extensions } = useExtensionState();
  const { getSettings } = useSettings();
  const { selectedKey, selectEntity, clearSelection } = useEntitySelection();

  const onHomeClickHandler = useCallback(() => {
    clearSelection();
    void Promise.resolve(closeCurrentChat())
      .catch((error) => {
        dislog.error('Error closing current chat:', error);
      })
      .finally(() => {
        // Signal Sidebar to go back to recent chats
        void Promise.resolve(
          eventSource.emit(DISCORDIA_EVENTS.HOME_BUTTON_CLICKED),
        ).catch((error) => {
          dislog.error('Error emitting home click event:', error);
        });
      });
  }, [clearSelection]);

  const hasCharLib = useMemo(() => {
    return extensions.some(
      (ext) => ext.manifest?.display_name === 'Character Library',
    );
  }, [extensions]);

  const visibleEntities = useMemo(
    () =>
      sortAndFilterEntities(
        entities,
        searchQuery,
        getSettings().behavior.favoritesOnTop,
      ),
    [entities, searchQuery, getSettings],
  );

  const itemData = useMemo(
    () => ({ entities: visibleEntities, selectedKey, onSelect: selectEntity }),
    [visibleEntities, selectedKey, selectEntity],
  );

  const handleAddCharacterClick = useCallback(() => {
    openModal(<CharacterModal type="create" />);
  }, [openModal]);

  return (
    <ErrorBoundary>
      <div id="character-container">
        <div id="characters-header">
          <HomeIcon onClick={onHomeClickHandler} />
          <div id="characters-divider" className="divider"></div>
        </div>

        <div id="characters-list" className="pt-0.5">
          {hasCharLib && (
            <Tooltip text="Character Library" direction="right">
              <CharacterLibraryButton />
            </Tooltip>
          )}
          {/* Show skeletons while loading */}
          {isInitialLoad && (
            <div className="flex flex-col items-center w-full">
              <SkeletonTheme
                borderRadius={'25%'}
                height={'48px'}
                width={'48px'}
                baseColor="#202025"
                highlightColor="#444449"
                enableAnimation={true}
                duration={1.7}
              >
                <Skeleton
                  containerClassName="flex-1"
                  count={15}
                  className="my-1 w-12 h-12 rounded-2xl"
                />
              </SkeletonTheme>
            </div>
          )}

          {/* A little trickery in performance */}
          {visibleEntities.length < 50 ? (
            <>
              {visibleEntities.map((entity) => (
                <ServerRow
                  key={entityKey(entity)}
                  entity={entity}
                  isSelected={selectedKey === entityKey(entity)}
                  onClick={selectEntity}
                />
              ))}
              <div id="characters-divider" className="divider" />
              <AddCharacterIcon onClick={handleAddCharacterClick} />
            </>
          ) : (
            <List
              rowComponent={Row}
              rowCount={visibleEntities.length + 1}
              rowHeight={60}
              rowProps={{ data: itemData }}
              style={{ width: '100%' }}
              overscanCount={5}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default memo(ServerBar);
