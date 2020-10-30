import { app } from 'electron';
import * as fsLib from 'fs';
import * as path from 'path';
import { AppData } from '../types';
import { LocalFileSystemDataSource } from '../datasource/LocalFileSystemDataSource';
import { defaultSettings } from '../settings/defaultSettings';
import { getElectronPath } from '../utils';

const fs = fsLib.promises;

const APPDATA_FILE = 'workspaces.json';

export class AppDataService {
  appData!: AppData;

  constructor() {}

  private getAppDataFile() {
    const userDataFolder = getElectronPath('userData');
    return path.join(userDataFolder, APPDATA_FILE);
  }

  private async init() {
    const userDataFolder = getElectronPath('userData');
    if (!fsLib.existsSync(userDataFolder)) {
      await fs.mkdir(userDataFolder);
    }

    const appDataFile = this.getAppDataFile();

    let appData: AppData = {
      workspaces: [],
      settings: defaultSettings
    };

    if (!fsLib.existsSync(appDataFile)) {
      await fs.writeFile(appDataFile, JSON.stringify(appData));
    } else {
      appData = JSON.parse(await fs.readFile(appDataFile, { encoding: 'utf8' }));
    }

    this.appData = appData;
  }

  // public async createWorkSpace(name: string, path: string) {
  //   // TODO kind
  //   const appDataFile = this.getAppDataFile();
//
  //   this.appData.workspaces.push({
  //     name,
  //     dataSourceType: 'fs',
  //     dataSourceOptions: {
  //       sourcePath: path,
  //     },
  //   });
//
  //   await fs.writeFile(appDataFile, JSON.stringify(this.appData));
  //   await LocalFileSystemDataSource.init({ sourcePath: path });
  // }
}
