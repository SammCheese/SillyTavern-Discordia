import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Button, { ButtonLook } from '../../components/common/Button/Button';
import Modal from '../../components/common/Modal/Modal';
import { ModalContext } from '../../providers/modalProvider';
import Input from '../../components/common/Input/Input';
import GroupAvatar from '../../components/groupAvatar/GroupAvatar';
import Divider from '../../components/common/Divider/Divider';
import Select from '../../components/common/Select/Select';
import Checkbox from '../../components/common/Checkbox/Checkbox';
import Accordion from '../../components/common/Accordion/Accordion';
import MemberList from './MemberCard';
import { saveGroup } from '../../utils/groupUtils';

const { deleteGroup } = await imports('@scripts/groupChats');

interface GroupEditModalProps {
  entity: Entity;
}

const { getContext } = SillyTavern;

const GroupEditModal = ({ entity }: GroupEditModalProps) => {
  const [group, setGroup] = useState<GroupItem | null>(entity.item || null);

  const { closeModal } = useContext(ModalContext);

  useEffect(() => {
    setGroup(entity.item || null);
  }, [entity]);

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
    const index = getContext().groups.findIndex((g) => g.id === entity.id);

    if (index !== -1) {
      getContext().groups[index] = group;
    }

    await saveGroup(group, true);

    closeModal();
  }, [entity, group, closeModal]);

  const handleNameChange = () => {};

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

  const handleOpenProfileClick = (character: Character) => {
    // TODO: Open character profile modal
    console.log('Open profile for character:', character);
  };

  const handleRemoveMember = (character: Character) => {
    const members = group?.members || [];
    const newMembers = members.filter((m) => m !== character.avatar);
    setGroup((prevGroup) =>
      prevGroup ? { ...prevGroup, members: newMembers } : prevGroup,
    );
  };

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
  }, [group]);

  return (
    <Modal>
      <Modal.Header>Edit Group</Modal.Header>

      <Modal.Content>
        <div className="flex flex-row gap-4 items-center">
          <div className="shrink-0 w-16 h-16">
            <GroupAvatar
              groupItem={entity.item}
              width={64}
              height={64}
              rounded
            />
          </div>
          <div className="flex flex-col grow">
            <label className="block mb-2 font-medium">Group Name</label>
            <Input
              defaultValue={entity.item?.name || ''}
              onChange={handleNameChange}
            />
          </div>
        </div>

        <Divider className="my-4" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col  gap-2">
              <label className="block mb-2 font-medium">Member Order:</label>
              <Select value={group!.generation_mode} options={orderOptions} />
            </div>
            <div className="flex flex-col  gap-2">
              <label className="block mb-2 font-medium">
                Generation Handling:
              </label>
              <Select
                value={group!.generation_mode}
                options={generationHandlingOptions}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Checkbox
              label="Allow Self responses"
              checked={group!.allow_self_responses}
            />

            <div className="flex flex-row items-center gap-2">
              <Checkbox
                label="Auto Mode"
                checked={group!.allow_self_responses}
              />
              <Input
                type="number"
                placeholder="5"
                value={group!.auto_mode_delay}
                onChange={() => {}}
              />
            </div>
            <Checkbox label="Hide Muted Members Sprites" checked={false} />
            <Checkbox label="Universal Tracker" checked={false} />
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
              <div className="flex flex-col gap-2">TODO</div>
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
        <Button onClick={handleSave}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GroupEditModal;
