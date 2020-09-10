import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';

console.log('process.env.NODE_ENV=', process.env.NODE_ENV);

app.on('ready', () => {
  let mainWindow: Electron.BrowserWindow | null = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      worldSafeExecuteJavaScript: true,
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
