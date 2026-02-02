import { useCallback, useMemo, useState } from 'react';
import Button, { ButtonLook } from '../../components/common/Button/Button';
import Modal from '../../components/common/Modal/Modal';
import { useModal } from '../../providers/modalProvider';
import Input from '../../components/common/Input/Input';
import GroupAvatar from '../../components/groupAvatar/GroupAvatar';
import Divider from '../../components/common/Divider/Divider';
import Select from '../../components/common/Select/Select';
import Checkbox from '../../components/common/Checkbox/Checkbox';
import Accordion from '../../components/common/Accordion/Accordion';
import MemberList from './Members/MemberList';
import { saveGroup } from '../../utils/groupUtils';
import AddMembers from './AddMembers';
import { DISCORDIA_EVENTS } from '../../events/eventTypes';
import CharacterModal from '../Character/CharacterModal';
import IconButton from '../../components/common/IconButton/IconButton';

const { deleteGroup, hideMutedSprites, is_group_automode_enabled } =
  await imports('@scripts/groupChats');
const { eventSource } = await imports('@script');

interface GroupEditModalProps {
  entity: Entity;
}

const { getContext } = SillyTavern;

const GroupEditModal = ({ entity }: GroupEditModalProps) => {
  const [group, setGroup] = useState<GroupItem | null>(entity.item || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [autoModeEnabled, setAutoModeEnabled] = useState<boolean>(
    is_group_automode_enabled,
  );
  const [hideMutedSpritesState, setHideMutedSpritesState] =
    useState<boolean>(hideMutedSprites);

  const { closeModal, openModal } = useModal();

  const handleClose = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleDelete = useCallback(async () => {
    if (!entity?.id) return;
    await deleteGroup(entity.id.toString());
    closeModal();
  }, [entity, closeModal]);

  const handleSave = useCallback(async () => {
    if (!entity?.id || !group) return;
    setLoading(true);

    try {
      const index = getContext().groups.findIndex((g) => g.id === entity.id);

      if (index !== -1) {
        getContext().groups[index] = group;
      }

      await saveGroup(group, true);

      // handle special cookies

      if (autoModeEnabled !== is_group_automode_enabled) {
        $('#rm_group_automode')
          .prop('checked', autoModeEnabled)
          .trigger('change');
      }

      if (hideMutedSpritesState !== hideMutedSprites) {
        $('#rm_group_hidemutedsprites')
          .prop('checked', hideMutedSpritesState)
          .trigger('change');
      }

      if (hideMutedSpritesState !== hideMutedSprites) {
        SillyTavern.getContext().setHideMutedSprites(hideMutedSpritesState);
      }

      await eventSource.emit(DISCORDIA_EVENTS.ENTITY_CHANGED);

      closeModal();
    } catch (error) {
      console.error('Error saving group:', error);
    } finally {
      setLoading(false);
    }
  }, [entity, group, closeModal, autoModeEnabled, hideMutedSpritesState]);

  const handleNameChange = useCallback((e: string) => {
    setGroup((prevGroup) =>
      prevGroup ? { ...prevGroup, name: e } : prevGroup,
    );
  }, []);

  const handleGroupSettingChange = useCallback(
    (setting: keyof GroupItem, value: string | number | boolean) => {
      setGroup((prevGroup) =>
        prevGroup ? { ...prevGroup, [setting]: value } : prevGroup,
      );
    },
    [],
  );

  const handleFavoriteToggle = useCallback(() => {
    setGroup((prevGroup) =>
      prevGroup ? { ...prevGroup, fav: !prevGroup.fav } : prevGroup,
    );
  }, []);

  const orderOptions = [
    { label: 'Manual', value: 2 },
    { label: 'Natural order', value: 0 },
    { label: 'List Order', value: 1 },
    { label: 'Pooled Order', value: 3 },
  ];

  const generationHandlingOptions = [
    { label: 'Swap character cards', value: 0 },
    { label: 'Join character cards (exclude muted)', value: 1 },
    { label: 'Join character cards (include muted)', value: 2 },
  ];

  const handleOrderChange = (
    character: Character,
    direction: 'up' | 'down',
  ) => {
    const members = group?.members || [];
    const index = members.indexOf(character.avatar || '');
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= members.length) return;

    const newMembers = [...members];
    const temp = newMembers[index];
    newMembers[index] = newMembers[newIndex] ?? '';
    newMembers[newIndex] = temp ?? '';

    setGroup((prevGroup) =>
      prevGroup ? { ...prevGroup, members: newMembers } : prevGroup,
    );
  };

  const handleOpenProfileClick = useCallback(
    (character: Character) => {
      openModal(
        <CharacterModal type="edit" avatarName={character.avatar || ''} />,
      );
    },
    [openModal],
  );

  const handleRemoveMember = useCallback(
    (character: Character) => {
      const members = group?.members || [];
      const newMembers = members.filter((m) => m !== character.avatar);
      setGroup((prevGroup) =>
        prevGroup ? { ...prevGroup, members: newMembers } : prevGroup,
      );
    },
    [group?.members, setGroup],
  );

  const handleAddMember = useCallback(
    (character: Character) => {
      const members = group?.members || [];
      if (character.avatar && members.includes(character.avatar)) return;

      const newMembers = [...members, character.avatar || ''];
      setGroup((prevGroup) =>
        prevGroup ? { ...prevGroup, members: newMembers } : prevGroup,
      );
    },
    [group?.members, setGroup],
  );

  const members = useMemo(() => {
    if (!group?.members) return [];

    const members: Character[] = [];

    for (const member of group.members) {
      if (!member) continue;
      const characterCard = getContext().characters.find(
        (c) => c.avatar === member,
      );
      if (!characterCard) continue;
      members.push(characterCard);
    }

    return members;
  }, [group?.members]);

  const disabled = useMemo(() => {
    if (!group) return true;
    if (loading) return true;
    if (group.name.trim() === '') return true;
    return false;
  }, [group, loading]);

  const handleGenerationModeChange = useCallback(
    (e: string | number) => {
      handleGroupSettingChange('generation_mode', parseInt(e as string));
    },
    [handleGroupSettingChange],
  );

  const handleActivationStrategyChange = useCallback(
    (e: string | number) => {
      handleGroupSettingChange('activation_strategy', parseInt(e as string));
    },
    [handleGroupSettingChange],
  );

  const handleAllowSelfResponsesChange = useCallback(
    (e: boolean) => {
      handleGroupSettingChange('allow_self_responses', e);
    },
    [handleGroupSettingChange],
  );

  const handleAutoModeDelayChange = useCallback(
    (e: string) => {
      handleGroupSettingChange('auto_mode_delay', parseInt(e));
    },
    [handleGroupSettingChange],
  );

  // Special cookies
  const handleAutoModeEnabledChange = useCallback(
    (e: boolean) => {
      setAutoModeEnabled(e);
    },
    [setAutoModeEnabled],
  );

  const handleHideMutedSpritesChange = useCallback(
    (e: boolean) => {
      setHideMutedSpritesState(e);
    },
    [setHideMutedSpritesState],
  );

  return (
    <Modal>
      <Modal.Header>Edit Group</Modal.Header>

      <Modal.Content>
        <div className="flex flex-row gap-4 items-center w-full p-6">
          <div className="shrink-0 w-20 h-20">
            <GroupAvatar
              groupItem={entity.item}
              width={80}
              height={80}
              rounded
            />
          </div>
          <div className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-col w-full relative">
              <label className="block mb-2 font-medium absolute -top-6 ">
                Group Name
              </label>
              <Input value={group?.name || ''} onChange={handleNameChange} />
            </div>
            <div className="ms-2">
              <IconButton
                faIcon="fa fa-solid fa-star"
                color={group?.fav ? 'yellow' : 'white'}
                onClick={handleFavoriteToggle}
              />
            </div>
          </div>
        </div>

        <Divider className="my-4" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col  gap-2">
              <label className="block mb-2 font-medium">Member Order:</label>
              <Select
                value={group!.activation_strategy}
                options={orderOptions}
                onChange={handleActivationStrategyChange}
              />
            </div>
            <div className="flex flex-col  gap-2">
              <label className="block mb-2 font-medium">
                Generation Handling:
              </label>
              <Select
                value={group!.generation_mode}
                options={generationHandlingOptions}
                onChange={handleGenerationModeChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Checkbox
              label="Allow Self responses"
              checked={group!.allow_self_responses}
              onChange={handleAllowSelfResponsesChange}
            />

            <div className="flex flex-row items-center gap-2">
              <Checkbox
                label="Auto Mode"
                checked={is_group_automode_enabled}
                onChange={handleAutoModeEnabledChange}
              />
              <Input
                type="number"
                placeholder="5"
                value={group!.auto_mode_delay}
                onChange={handleAutoModeDelayChange}
              />
            </div>
            <Checkbox
              label="Hide Muted Members Sprites"
              checked={hideMutedSprites}
              onChange={handleHideMutedSpritesChange}
            />
          </div>

          <div>
            <Accordion title="Current Members">
              <div className="flex flex-col gap-2">
                <MemberList
                  members={members}
                  onOrderChange={handleOrderChange}
                  onRemoveMember={handleRemoveMember}
                  onOpenMemberProfile={handleOpenProfileClick}
                />
              </div>
            </Accordion>
          </div>

          <div>
            <Accordion title="Add Members">
              <div className="flex flex-col gap-2">
                <AddMembers onAdd={handleAddMember} existingMembers={members} />
              </div>
            </Accordion>
          </div>
        </div>
      </Modal.Content>

      <Modal.Footer>
        <div className="grow">
          <Button look={ButtonLook.DANGER} onClick={handleDelete}>
            Delete
          </Button>
        </div>
        <Button look={ButtonLook.TRANSPARENT} onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={disabled}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GroupEditModal;
