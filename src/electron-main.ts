import { app, BrowserWindow, ipcMain, protocol, shell } from 'electron';
import * as path from 'path';
import { IpcChannel } from './IpcChannel';
import { AutoUpdate } from './appdata/AutoUpdate';
import serveStatic from 'serve-static';
import http from 'http';
import getPort from 'get-port';
import finalhandler from 'finalhandler';

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

app.on('ready', async () => {
  let mainWindow: Electron.BrowserWindow | null = new BrowserWindow({
    width: 1370,
    height: 780,
    minWidth: 500,
    minHeight: 400,
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
    const serve = serveStatic(path.join(app.getAppPath(), '/app/'), { 'index': ['index.html', 'index.htm'] })

    const server = http.createServer((req, res) => {
      serve(req as any, res as any, finalhandler as any);
    });

    const port = await getPort({ port: 9990 });
    server.listen(port);
    mainWindow.loadURL(`http://localhost:${port}`);
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

  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
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

