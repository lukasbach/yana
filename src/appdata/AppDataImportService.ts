import { DataInterface } from '../datasource/DataInterface';
import { DataItem } from '../types';
import { LocalFileSystemDataSource } from '../datasource/LocalFileSystemDataSource';
import { remote } from "electron";
import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import { getElectronPath, isMediaItem, isNoteItem } from '../utils';
import unzipper from 'unzipper';
import { AppDataContextValue } from './AppDataProvider';
import { EditorRegistry } from '../editors/EditorRegistry';

export class AppDataImportService {
  public static async import(sourcePath: string, name: string, newWorkspaceFolder: string, appDataContext: AppDataContextValue, onUpdate: (message: string) => void) {
    const folder = path.resolve(getElectronPath('temp'), 'yana-import');

    onUpdate('Clearing temporary folder');
    await new Promise(r => rimraf(folder, r));
    await fs.promises.mkdir(folder, { recursive: true });

    await appDataContext.createWorkSpace(name, newWorkspaceFolder);

    const di = new DataInterface(new LocalFileSystemDataSource({
      sourcePath: newWorkspaceFolder
    }), EditorRegistry.Instance, 50);

    await di.load();

    await new Promise(res => fs.createReadStream(sourcePath)
      .pipe(unzipper.Extract({ path: folder })).on('close', () => res()));

    const media: { [id: string]: string } = JSON.parse(await fs.promises.readFile(
      path.join(folder, 'media.json'), { encoding: 'utf8' }));

    for (const itemName of await fs.promises.readdir(path.join(folder, 'items'))) {
      const item: DataItem = JSON.parse(await fs.promises.readFile(
        path.join(folder, 'items', itemName), { encoding: 'utf8' }));

      await di.createDataItem(item);

      if (isNoteItem(item)) {
        const content = JSON.parse(await fs.promises.readFile(
          path.join(folder, 'notes', item.id + '.json'), { encoding: 'utf8' }));
        await di.writeNoteItemContent(item.id, content);
      } else if (isMediaItem(item)) {
        await di.storeMediaItemContent(item.id, path.join(folder, media[item.id]), { width: 300 });
      }
    }
  }
}
