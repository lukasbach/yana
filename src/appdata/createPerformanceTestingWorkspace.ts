import { Alerter } from '../components/Alerter';
import * as electron from 'electron';
import { DataItemKind } from '../types';
import { InternalTag } from '../datasource/InternalTag';
import { AppDataContextValue } from './AppDataProvider';
import { DataInterface } from '../datasource/DataInterface';
import { EditorRegistry } from '../editors/EditorRegistry';
import { LocalSqliteDataSource } from '../datasource/LocalSqliteDataSource';
import { LogService } from '../common/LogService';

const BIG_FOLDER_CHILD_COUNTS = [10, 25, 50, 100, 250, 500, 1_000, 20_000];

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
        onConfirmText: value => res(value),
      },
    });
  });

  if (!workspaceName) return;

  const workspacePathDialog = await electron.dialog.showOpenDialog({
    buttonLabel: 'Set',
    properties: ['createDirectory', 'openDirectory'],
    title: 'Choose a location where to store the workspace at',
  });

  if (workspacePathDialog.canceled || !workspacePathDialog.filePaths[0]) return;

  const workspacePath = workspacePathDialog.filePaths[0];

  const currentWorkspace = appDataContext.currentWorkspace;
  await appDataContext.createWorkSpace(workspaceName, workspacePath, 'sqlite3'); // TODO
  await appDataContext.setWorkSpace(currentWorkspace);

  const di = new DataInterface(
    new LocalSqliteDataSource({
      // TODO
      sourcePath: workspacePath,
    }),
    EditorRegistry.Instance,
    500
  );

  await di.load();

  LogService.enabled = false;

  const searchResult = await di.search({ tags: [InternalTag.WorkspaceRoot], limit: 1 });
  const root = searchResult.results[0];

  const bigFoldersContainer = await di.createDataItemUnderParent(
    {
      name: 'Folders with many items',
      created: new Date().getTime(),
      lastChange: new Date().getTime(),
      tags: [],
      kind: DataItemKind.Collection,
      childIds: [],
    },
    root.id
  );

  const deepContainer = await di.createDataItemUnderParent(
    {
      name: 'Very deep container',
      created: new Date().getTime(),
      lastChange: new Date().getTime(),
      tags: [],
      kind: DataItemKind.Collection,
      childIds: [],
    },
    root.id
  );

  for (const count of BIG_FOLDER_CHILD_COUNTS) {
    console.log('Creating big folders of size' + count);
    let lastAnnouncedPercentage = 0;

    const container = await di.createDataItemUnderParent(
      {
        name: `${count} items`,
        created: new Date().getTime(),
        lastChange: new Date().getTime(),
        tags: [],
        kind: DataItemKind.Collection,
        childIds: [],
      },
      bigFoldersContainer.id
    );

    for (let i = 0; i < count; i++) {
      const percentage = Math.floor((i / count) * 100);

      if (percentage > lastAnnouncedPercentage) {
        lastAnnouncedPercentage = percentage;
        console.log(percentage + '% done of folder with ' + count + ' items');
      }

      const note = await di.createDataItemUnderParent(
        {
          name: `Item ${i}/${count}`,
          created: new Date().getTime(),
          lastChange: new Date().getTime(),
          tags: [],
          kind: DataItemKind.NoteItem,
          childIds: [],
          noteType: 'atlaskit-editor-note',
        } as any,
        container.id
      );
      await di.writeNoteItemContent(note.id, {
        adf: {
          version: 1,
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Welcome to ' },
                {
                  type: 'text',
                  text: 'Yana',
                  marks: [{ type: 'em' }, { type: 'strong' }, { type: 'textColor', attrs: { color: '#00b8d9' } }],
                },
                { type: 'text', text: ', your easy notebook app with lots of different features!' },
              ],
            },
          ],
        },
      });
    }
  }

  let depthContainerId = deepContainer.id;
  for (let depth = 0; depth < 100; depth++) {
    const container = await di.createDataItemUnderParent(
      {
        name: `Depth ${depth}`,
        created: new Date().getTime(),
        lastChange: new Date().getTime(),
        tags: [],
        kind: DataItemKind.Collection,
        childIds: [],
      },
      depthContainerId
    );
    for (let i = 0; i < 5; i++) {
      const note = await di.createDataItemUnderParent(
        {
          name: `Note ${i} at Depth ${depth}`,
          created: new Date().getTime(),
          lastChange: new Date().getTime(),
          tags: [],
          kind: DataItemKind.NoteItem,
          childIds: [],
          noteType: 'atlaskit-editor-note',
        } as any,
        depthContainerId
      );
      await di.writeNoteItemContent(note.id, {
        adf: {
          version: 1,
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Welcome to ' },
                {
                  type: 'text',
                  text: 'Yana',
                  marks: [{ type: 'em' }, { type: 'strong' }, { type: 'textColor', attrs: { color: '#00b8d9' } }],
                },
                { type: 'text', text: ', your easy notebook app with lots of different features!' },
              ],
            },
          ],
        },
      });
    }
    depthContainerId = container.id;
  }

  await di.persist();
  await di.unload();

  Alerter.Instance.alert({ content: 'Done.' });

  LogService.enabled = true;
};
