import { memo, useEffect } from 'react';
import Modal from '../../components/common/Modal/Modal';
import { DISCORDIA_EVENTS } from '../../events/eventTypes';

import { eventSource } from '../../st/script';
const ChangeFilters = () => {
  useEffect(() => {
    return () => {
      eventSource.emit(DISCORDIA_EVENTS.ENTITY_CHANGED);
    };
  }, []);

  return (
    <Modal>
      <Modal.Header>Change Filters</Modal.Header>
      <Modal.Content></Modal.Content>
      <Modal.Footer></Modal.Footer>
    </Modal>
  );
};

export default memo(ChangeFilters);
