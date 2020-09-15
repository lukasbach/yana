import { DataInterface, ItemChangeEvent } from '../datasource/DataInterface';
import { EventEmitter } from './EventEmitter';
import { useEffect, useState } from 'react';

export const useEventChangeHandler = <T extends object>(eventEmitter: EventEmitter<T>, handler: (payload: T) => void, dependencies: any[]) => {
  const [eventHandler, setEventHandler] = useState<undefined | number>();

  useEffect(() => {
    if (eventHandler) {
      eventEmitter.delete(eventHandler);
    }

    setEventHandler(eventEmitter.on(handler));

    return () => {
      if (eventHandler) {
        eventEmitter.delete(eventHandler);
      }
    }
  }, [eventEmitter, ...dependencies]);
};