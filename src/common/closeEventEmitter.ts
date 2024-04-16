import { EventEmitter } from './EventEmitter';
import * as remote from '@electron/remote';
import { IpcChannel } from '../IpcChannel';

export const closeEventEmitter = new EventEmitter<{}>();

if (remote) {
  // Only do if not on electron-main.ts
  remote.ipcMain.removeAllListeners(IpcChannel.InitiateQuit);
  remote.ipcMain.on(IpcChannel.InitiateQuit, e => {
    closeEventEmitter.emit({}).then(() => {
      remote.ipcMain.emit(IpcChannel.ConfirmQuit);
    });
  });
}
