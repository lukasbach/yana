import { remote } from 'electron';
import { EventEmitter } from './EventEmitter';
import { IpcChannel } from '../IpcChannel';
import { useEventChangeHandler } from './useEventChangeHandler';

const closeEventEmitter = new EventEmitter<{}>();

remote.ipcMain.removeAllListeners(IpcChannel.InitiateQuit);
remote.ipcMain.on(IpcChannel.InitiateQuit, e => {
  closeEventEmitter.emit({}).then(() => {
    remote.ipcMain.emit(IpcChannel.ConfirmQuit);
  });
});

export const useCloseEvent = (handler: () => Promise<void>, deps: any[] = []) => {
  useEventChangeHandler(closeEventEmitter, handler, deps);
};
