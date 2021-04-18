import path from 'path';
import { getElectronPath } from '../utils';

export const userDataFolder = path.join(getElectronPath('appData'), 'yana');
export const appDataFile = path.join(userDataFolder, 'workspaces.json');

console.log('AppDataFile located at', appDataFile);
