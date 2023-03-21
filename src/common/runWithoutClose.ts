import { closeEventEmitter } from './closeEventEmitter';

export const runWithoutClose = async (handler: () => Promise<any>) => {
  let resolve: any;
  const completePromise = new Promise<void>(res => {
    resolve = res;
  });

  const handlerId = closeEventEmitter.on(async () => {
    await completePromise;
  });

  await handler();
  resolve();
  closeEventEmitter.delete(handlerId);
};
