import { DataItemKind, DataSourceType, WorkSpace } from '../types';
import { InternalTag } from '../datasource/InternalTag';
import * as fs from 'fs';
import * as pathLib from 'path';
import { DataSourceRegistry } from '../datasource/DataSourceRegistry';

export const initializeWorkspace = async (name: string, path: string, dataSourceType: DataSourceType, empty?: boolean): Promise<WorkSpace> => {
  if (fs.existsSync(pathLib.join(path, 'notebook.json'))) {
    throw Error('A workspace already exists at the specified location.');
  }

  const workspace: WorkSpace = {
    name,
    dataSourceType: dataSourceType,
    dataSourceOptions: { sourcePath: path }
  };
  await DataSourceRegistry.initDataSource(workspace);
  const dataSource = DataSourceRegistry.getDataSource(workspace);
  await dataSource.load();

  if (!empty) {
    const note1 = await dataSource.createDataItem({
      name: 'Welcome to Yana!',
      created: new Date().getTime(),
      lastChange: new Date().getTime(),
      tags: [InternalTag.Starred],
      kind: DataItemKind.NoteItem,
      childIds: [],
      noteType: 'atlaskit-editor-note'
    } as any);

    await dataSource.writeNoteItemContent(note1.id, {"adf":{"version":1,"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Welcome to "},{"type":"text","text":"Yana","marks":[{"type":"em"},{"type":"strong"},{"type":"textColor","attrs":{"color":"#00b8d9"}}]},{"type":"text","text":", your easy notebook app with lots of different features!"}]}]}});

    const collection1 = await dataSource.createDataItem({
      name: 'Welcome',
      created: new Date().getTime(),
      lastChange: new Date().getTime(),
      tags: [],
      kind: DataItemKind.Collection,
      childIds: [note1.id]
    });

    const myCollections = await dataSource.createDataItem({
      name: 'My Collections',
      created: new Date().getTime(),
      lastChange: new Date().getTime(),
      tags: [InternalTag.Internal],
      kind: DataItemKind.Collection,
      childIds: [collection1.id]
    });

    await dataSource.createDataItem({
      name: 'workspace-root',
      created: new Date().getTime(),
      lastChange: new Date().getTime(),
      tags: [InternalTag.WorkspaceRoot, InternalTag.Internal],
      kind: DataItemKind.Collection,
      childIds: [myCollections.id]
    });
  }

  await dataSource.persist();
  await dataSource.unload();

  return {
    name,
    dataSourceType: dataSourceType,
    dataSourceOptions: {
      sourcePath: path,
    },
  };
}