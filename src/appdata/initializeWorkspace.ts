import { DataItemKind, NoteDataItem, WorkSpace } from '../types';
import { LocalFileSystemDataSource } from '../datasource/LocalFileSystemDataSource';
import { InternalTag } from '../datasource/InternalTag';

export const initializeWorkspace = async (name: string, path: string): Promise<WorkSpace> => {
  const options = { sourcePath: path };
  await LocalFileSystemDataSource.init(options);
  const dataSource = new LocalFileSystemDataSource(options);
  await dataSource.load();

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
    tags: [],
    kind: DataItemKind.Collection,
    childIds: [collection1.id]
  });

  await dataSource.createDataItem({
    name: 'workspace-root',
    created: new Date().getTime(),
    lastChange: new Date().getTime(),
    tags: [InternalTag.WorkspaceRoot],
    kind: DataItemKind.Collection,
    childIds: [myCollections.id]
  });

  await dataSource.persist();

  return {
    name,
    dataSourceType: 'fs',
    dataSourceOptions: {
      sourcePath: path,
    },
  };
}