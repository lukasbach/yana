import { useEventChangeHandler } from './useEventChangeHandler';
import { closeEventEmitter } from './closeEventEmitter';

export const useCloseEvent = (handler: () => Promise<void>, deps: any[] = []) => {
  useEventChangeHandler(closeEventEmitter, handler, deps);
};
