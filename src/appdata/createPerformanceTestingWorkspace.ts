import { LocalFileSystemDataSource } from '../datasource/LocalFileSystemDataSource';
import { Alerter } from '../components/Alerter';
import { remote } from "electron";
import { DataItemKind } from '../types';
import { InternalTag } from '../datasource/InternalTag';
import { AppDataContextValue } from './AppDataProvider';
import { DataInterface } from '../datasource/DataInterface';
import { EditorRegistry } from '../editors/EditorRegistry';

const BIG_FOLDER_CHILD_COUNTS = [10, 25, 50, 100, 250, 500, 1000];

export const createPerformanceTestingWorkspace = async (appDataContext: AppDataContextValue) => {
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

  const workspacePathDialog = await remote.dialog.showOpenDialog({
    buttonLabel: 'Set',
    properties: ['createDirectory', 'openDirectory'],
    title: 'Choose a location where to store the workspace at',
  });

  if (workspacePathDialog.canceled || !workspacePathDialog.filePaths[0]) return;

  const workspacePath = workspacePathDialog.filePaths[0];

  const currentWorkspace = appDataContext.currentWorkspace;
  await appDataContext.createWorkSpace(workspaceName, workspacePath);
  await appDataContext.setWorkSpace(currentWorkspace);

  const di = new DataInterface(new LocalFileSystemDataSource({
    sourcePath: workspacePath
  }), EditorRegistry.Instance, 500);

  await di.load();

  const [root] = await di.searchImmediate({ tags: [InternalTag.WorkspaceRoot] });

  const bigFoldersContainer = await di.createDataItemUnderParent({
    name: 'Folders with many items',
    created: new Date().getTime(),
    lastChange: new Date().getTime(),
    tags: [],
    kind: DataItemKind.Collection,
    childIds: []
  }, root.id);

  const deepContainer = await di.createDataItemUnderParent({
    name: 'Very deep container',
    created: new Date().getTime(),
    lastChange: new Date().getTime(),
    tags: [],
    kind: DataItemKind.Collection,
    childIds: []
  }, root.id);

  for (const count of BIG_FOLDER_CHILD_COUNTS) {
    const container = await di.createDataItemUnderParent({
      name: `${count} items`,
      created: new Date().getTime(),
      lastChange: new Date().getTime(),
      tags: [],
      kind: DataItemKind.Collection,
      childIds: []
    }, bigFoldersContainer.id);

    for (let i = 0; i < count; i++) {
      const note = await di.createDataItemUnderParent({
        name: `Item ${i}/${count}`,
        created: new Date().getTime(),
        lastChange: new Date().getTime(),
        tags: [],
        kind: DataItemKind.NoteItem,
        childIds: [],
        noteType: 'atlaskit-editor-note'
      } as any, container.id);
      await di.writeNoteItemContent(note.id, {"adf":{"version":1,"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Welcome to "},{"type":"text","text":"Yana","marks":[{"type":"em"},{"type":"strong"},{"type":"textColor","attrs":{"color":"#00b8d9"}}]},{"type":"text","text":", your easy notebook app with lots of different features!"}]}]}});
    }
  }

  let depthContainerId = deepContainer.id;
  for (let depth = 0; depth < 100; depth++) {
    const container = await di.createDataItemUnderParent({
      name: `Depth ${depth}`,
      created: new Date().getTime(),
      lastChange: new Date().getTime(),
      tags: [],
      kind: DataItemKind.Collection,
      childIds: []
    }, depthContainerId);
    for (let i = 0; i < 5; i++) {
      const note = await di.createDataItemUnderParent({
        name: `Note ${i} at Depth ${depth}`,
        created: new Date().getTime(),
        lastChange: new Date().getTime(),
        tags: [],
        kind: DataItemKind.NoteItem,
        childIds: [],
        noteType: 'atlaskit-editor-note'
      } as any, depthContainerId);
      await di.writeNoteItemContent(note.id, {"adf":{"version":1,"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Welcome to "},{"type":"text","text":"Yana","marks":[{"type":"em"},{"type":"strong"},{"type":"textColor","attrs":{"color":"#00b8d9"}}]},{"type":"text","text":", your easy notebook app with lots of different features!"}]}]}});
    }
    depthContainerId = container.id;
  }

  await di.persist();
  await di.unload();

  Alerter.Instance.alert({ content: 'Done.' });
}