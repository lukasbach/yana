import { AppDataContext, AppDataContextValue } from './AppDataProvider';
import path from "path";
import { getElectronPath, isMediaItem, isNoteItem } from '../utils';
import rimraf from 'rimraf';
import fs from "fs";
import { DataInterface } from '../datasource/DataInterface';
import { EditorRegistry } from '../editors/EditorRegistry';
import unzipper from 'unzipper';
import { DataItem } from '../types';
import { Alerter } from '../components/Alerter';
import { LocalSqliteDataSource } from '../datasource/LocalSqliteDataSource';
import { TelemetryService } from '../components/telemetry/TelemetryProvider';
import { TelemetryEvents } from '../components/telemetry/TelemetryEvents';

export const runImport = async (
  sourcePath: string,
  name: string,
  newWorkspaceFolder: string,
  appDataContext: AppDataContextValue,
  onUpdate: (message: string) => void,
) => {
  try {
    const folder = path.resolve(getElectronPath('temp'), 'yana-import');

    onUpdate('Clearing temporary folder');
    await new Promise(r => rimraf(folder, r));
    await fs.promises.mkdir(folder, {recursive: true});

    onUpdate('Creating new workspace');
    const workspace = await appDataContext.createWorkSpace(name, newWorkspaceFolder, 'sqlite3', true); // TODO

    onUpdate('Initiating DataInterface');
    const di = new DataInterface(new LocalSqliteDataSource({ // TODO
      sourcePath: newWorkspaceFolder
    }), EditorRegistry.Instance, 50);

    onUpdate('Loading DataInterface');
    await di.load();

    onUpdate('Unzipping exported zip');
    await new Promise(res => fs.createReadStream(sourcePath)
      .pipe(unzipper.Extract({path: folder})).on('close', () => res()));

    onUpdate('Ceating media.json');
    const media: { [id: string]: string } = JSON.parse(await fs.promises.readFile(
      path.join(folder, 'media.json'), {encoding: 'utf8'}));

    onUpdate('Creating data items');
    for (const itemName of await fs.promises.readdir(path.join(folder, 'items'))) {
      const item: DataItem = JSON.parse(await fs.promises.readFile(
        path.join(folder, 'items', itemName), {encoding: 'utf8'}));
      onUpdate('Creating item ' + item.name);

      await di.createDataItem(item);

      if (isNoteItem(item)) {
        const content = JSON.parse(await fs.promises.readFile(
          path.join(folder, 'notes', item.id + '.json'), {encoding: 'utf8'}));
        await di.writeNoteItemContent(item.id, content);
      } else if (isMediaItem(item)) {
        await di.storeMediaItemContent(item.id, path.join(folder, media[item.id]), {width: 300});
      }
    }
    onUpdate('Finished creating items. Unloading DataInterface.');

    await di.unload();
    appDataContext.setWorkSpace(workspace);
    TelemetryService?.trackEvent(...TelemetryEvents.Workspaces.import);
  } catch(e) {
    TelemetryService?.trackException('import_workspace_error', true);
    Alerter.Instance.alert({
      content: `Error: ${e.message}`,
      intent: 'danger',
      canEscapeKeyCancel: true,
      canOutsideClickCancel: true,
      icon: 'warning-sign',
    });
  }
}