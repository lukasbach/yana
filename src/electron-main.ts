import { app, BrowserWindow, protocol } from 'electron';
import * as path from 'path';
import * as url from 'url';

console.log('process.env.NODE_ENV=', process.env.NODE_ENV);

app.whenReady().then(() => {
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''));
    callback(pathname);
  });
});

app.on('ready', () => {
  let mainWindow: Electron.BrowserWindow | null = new BrowserWindow({
    width: 800,
    height: 600,
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.allowRendererProcessReuse = true;
// TODO maybe set to false?
// https://github.com/electron/electron/issues/22119

// In render process:
// setInterval(function(){
//   process.stdout.write("")
// },2)

// https://github.com/electron/electron/issues/19554

