import { DataItem, SearchResult, WorkSpace } from '../types';
import { DataInterface } from '../datasource/DataInterface';
import { DataSourceRegistry } from '../datasource/DataSourceRegistry';
import fs from 'fs-extra';
import path from 'path';
import { isCollectionItem, isMediaItem, isNoteItem } from '../utils';
import rimraf from 'rimraf';
import { InternalTag } from '../datasource/InternalTag';
import { EditorRegistry } from '../editors/EditorRegistry';

export type MarkdownExportOptions = {
  targetFolder: string;
  makeTextFilesToMarkdown: boolean;
}

export const runMarkdownExport = async (options: MarkdownExportOptions, workspace: WorkSpace) => {
  console.log("Clearing...", options.targetFolder);
  await new Promise(r => rimraf(options.targetFolder, r));
  await fs.ensureDir(options.targetFolder);

  const di = new DataInterface(
    DataSourceRegistry.getDataSource(workspace),
    EditorRegistry.Instance,
    300
  );

  const items: DataItem[] = [];
  let result: SearchResult = { nextPageAvailable: true, results: [] };
  do {
    result = await di.search({ all: true, limit: 200, pagingValue: result.nextPagingValue });
    for (const item of result.results) {
      items.push(item);
      if (isMediaItem(item) && !item.referencePath) {
        const mediaItem = await di.loadMediaItemContentAsPath(item.id);
        console.log("media item", item, mediaItem);
      } else if (isNoteItem(item)) {
        const content = await di.getNoteItemContent(item.id);
        console.log("note", item);
      }
    }
  } while (result.nextPageAvailable);

  const rootItem = items.find(item => item.tags.includes(InternalTag.WorkspaceRoot));
  if (!rootItem) {
    throw new Error("Root item not found");
  }

  await processItem(rootItem, "", options, di, items);


  await di.unload();
}

const processItem = async (item: DataItem, parent: string, options: MarkdownExportOptions, di: DataInterface, items: DataItem[]) => {
  console.log(`Exporting ${item.name} (${parent})...`);
  const pathFriendlyName = item.name.replace(/[^a-zA-Z0-9- ]/g, "_");
  const itemPath = path.join(options.targetFolder, parent);

  if (isNoteItem(item)) {
    const content = await di.getNoteItemContent<any>(item.id);
    const dump = await EditorRegistry.Instance.getEditorWithId(item.noteType).exportContent(content, item, options);
    const ext = options.makeTextFilesToMarkdown ? "md" : EditorRegistry.Instance.getEditorWithId(item.noteType).getExportFileExtension(content);
    await fs.ensureDir(itemPath);
    await fs.writeFile(path.join(itemPath, `${pathFriendlyName}.${ext}`), dump);
  }

  if (item.childIds.length > 0 && isCollectionItem(item)) {
    const newParent = path.join(parent, pathFriendlyName);
    await fs.ensureDir(path.join(itemPath, pathFriendlyName));

    for (const child of item.childIds) {
      const childItem = items.find(i => i.id === child);
      if (childItem) {
        await processItem(childItem, newParent, options, di, items);
      }
    }
  }
}