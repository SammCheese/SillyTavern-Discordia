import { useContext, useEffect, useId } from 'react';
import { BackHandlerContext } from '../providers/backHandlerProvider';

export const useBackHandler = (
  isActive: boolean,
  onBack: () => void,
  timeout?: number,
) => {
  const { register, unregister } = useContext(BackHandlerContext);

  const id = useId();

  useEffect(() => {
    if (!isActive) return;
    register(id, onBack, timeout);
    return () => {
      unregister(id);
    };
  }, [isActive, onBack, register, unregister, id, timeout]);
};
