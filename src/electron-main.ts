import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { IpcChannel } from './IpcChannel';
import { AutoUpdate } from './appdata/AutoUpdate';

console.log('process.env.NODE_ENV=', process.env.NODE_ENV);

let isQuitting = false;

(async () => {
  if (process.env.NODE_ENV === 'production') {
    const updates = new AutoUpdate();
    await updates.load();
    await updates.runAutoUpdateIfSettingsSet();
  } else {
    console.log("Skipping potential updates, dev mode.");
  }
})();

app.whenReady().then(() => {
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''));
    callback(pathname);
  });
});

app.on('ready', () => {
  let mainWindow: Electron.BrowserWindow | null = new BrowserWindow({
    width: 1370,
    height: 780,
    center: true,
    frame: false,
    resizable: true,

    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      worldSafeExecuteJavaScript: true,
      enableRemoteModule: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(`http://localhost:4000`);
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(app.getAppPath(), '/app/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  mainWindow.on('close', e => {
    if (!isQuitting) {
      e.preventDefault();

      ipcMain.once(IpcChannel.ConfirmQuit, e => {
        isQuitting = true;
        app.quit();
      });
      ipcMain.emit(IpcChannel.InitiateQuit);
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.allowRendererProcessReuse = false;
// TODO maybe set to false?
// https://github.com/electron/electron/issues/22119

// In render process:
// setInterval(function(){
//   process.stdout.write("")
// },2)

// https://github.com/electron/electron/issues/19554

