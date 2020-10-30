import { DataInterface } from '../datasource/DataInterface';
import { WorkSpace } from '../types';
import { LocalFileSystemDataSource } from '../datasource/LocalFileSystemDataSource';
import { remote } from "electron";
import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import { getElectronPath, isMediaItem, isNoteItem } from '../utils';
import archiver from 'archiver';

export class AppDataExportService {
  public static async exportTo(destination: string, workspace: WorkSpace, onUpdate: (message: string) => void) {
    const folder = path.resolve(getElectronPath('temp'), 'yana-export', Math.random().toString(36).substring(14));
    onUpdate(`Temporary folder: ${folder}`);

    const mediaItems: { [key: string]: string } = {};

    onUpdate('Clearing temporary folder');
    await new Promise(r => rimraf(folder, r));
    await fs.promises.mkdir(folder, { recursive: true });
    await fs.promises.mkdir(path.resolve(folder, 'items'));
    await fs.promises.mkdir(path.resolve(folder, 'media'));
    await fs.promises.mkdir(path.resolve(folder, 'notes'));

    const di = new DataInterface(
      new LocalFileSystemDataSource(workspace.dataSourceOptions),
      null as any, // because used in electron-main, and editor registry contains monaco code
      300
    );
    onUpdate('Loading workspace');
    await di.load();

    onUpdate('Loading data items from workspace');
    const result = await di.searchImmediate({ all: true });
    for (const item of result) {
      await fs.promises.writeFile(path.resolve(folder, 'items', `${item.id}.json`), JSON.stringify(item));

      if (isMediaItem(item) && !item.referencePath) {
        const mediaItem = await di.loadMediaItemContentAsPath(item.id);
        const internalPath = `media/${path.basename(mediaItem)}`;
        console.log("!!", internalPath)
        await fs.promises.copyFile(mediaItem, path.resolve(folder, internalPath));
        mediaItems[item.id] = internalPath;
      } else if (isNoteItem(item)) {
        const content = await di.getNoteItemContent(item.id);
        await fs.promises.writeFile(path.resolve(folder, 'notes', `${item.id}.json`), JSON.stringify(content));
      }
    }

    await di.unload();

    onUpdate('Storing meta data');
    await fs.promises.writeFile(path.resolve(folder, 'media.json'), JSON.stringify(mediaItems));
    await fs.promises.writeFile(path.resolve(folder, 'workspace.json'), JSON.stringify({
      ...workspace,
      name: workspace.name,
    }));

    const basePath = path.dirname(destination);
    if (!fs.existsSync(basePath)) {
      onUpdate('Creating target folder');
      await fs.promises.mkdir(basePath, { recursive: true });
    }

    onUpdate('Preparing Zip file');
    const output = fs.createWriteStream(destination);
    const archive = archiver('zip', {
      zlib: { level: 1 }
    });

    archive.pipe(output);

    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        // log warning
        console.log(err)
      } else {
        // throw error
        throw err;
      }
    });

    archive.on('error', function(err) {
      throw err;
    });

    archive.directory(folder + '/', false);

    return new Promise(res => {
      output.on('close', function() {
        onUpdate('Clearing temporary folder');
        rimraf(folder, () => {});
        onUpdate('Done');
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        res();
      });
      archive.finalize();
      onUpdate('Storing zip file');
    })
  }
}
