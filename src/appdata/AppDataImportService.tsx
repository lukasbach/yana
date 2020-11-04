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
import { Alerter } from '../components/Alerter';
import * as React from 'react';

export class AppDataImportService {
  public static async initiateImportWizard(appDataContext: AppDataContextValue) {
    const zipResult = await remote.dialog.showOpenDialog({
      buttonLabel: 'Import',
      properties: [],
      title: 'Choose a exported workspace',
    });

    if (zipResult.canceled || !zipResult.filePaths[0]) return;

    const workspaceName: string | undefined = await new Promise(res => {
      Alerter.Instance.alert({
        confirmButtonText: 'Okay',
        cancelButtonText: 'Cancel',
        content: 'Choose a name for the imported workspace',
        canOutsideClickCancel: true,
        canEscapeKeyCancel: true,
        prompt: {
          type: 'string',
          onConfirmText: value => res(value)
        }
      });
    });

    if (!workspaceName) return;

    const destResult = await remote.dialog.showOpenDialog({
      buttonLabel: 'Set',
      properties: ['createDirectory', 'openDirectory'],
      title: 'Choose a location where to store the workspace at',
    });

    if (destResult.canceled || !destResult.filePaths[0]) return;

    const confirmed: boolean = await new Promise(res => {
      Alerter.Instance.alert({
        confirmButtonText: 'Okay',
        cancelButtonText: 'Cancel',
        content: <>Do you want to import the workspace into the folder
          <pre>{ destResult.filePaths[0] }</pre>? The files will be spread
        directly into this folder. You cannot change this later!</>,
        canOutsideClickCancel: true,
        canEscapeKeyCancel: true,
        onConfirm: () => res(true),
        onCancel: () => res(false),
      });
    });

    if (!confirmed) return;

    await AppDataImportService.import(
      zipResult.filePaths[0],
      workspaceName,
      destResult.filePaths[0],
      appDataContext,
      console.log
    );
  }

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

    await di.unload();
  }
}
