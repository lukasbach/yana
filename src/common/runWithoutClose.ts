import { closeEventEmitter } from './closeEventEmitter';

export const runWithoutClose = async (handler: () => Promise<any>) => {
  let resolve: () => void = () => {};
  const completePromise = new Promise(res => {
    resolve = res;
  });

  const handlerId = closeEventEmitter.on(async () => {
    await completePromise;
  });

  await handler();
  resolve();
  closeEventEmitter.delete(handlerId);
};