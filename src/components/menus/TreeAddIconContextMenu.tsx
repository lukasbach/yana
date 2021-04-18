import * as React from 'react';
import { CollectionDataItem, DataItem, DataItemKind } from '../../types';
import { MenuRenderer } from './types';
import { MainContentContextType } from '../mainContent/context';
import { DataInterface } from '../../datasource/DataInterface';
import { TelemetryService } from '../telemetry/TelemetryProvider';
import { TelemetryEvents } from '../telemetry/TelemetryEvents';

export const TreeAddIconContextMenu: React.FC<{
  item: CollectionDataItem;
  renderer: MenuRenderer;
  onCreatedItem?: (item: DataItem) => void;
  mainContent: MainContentContextType;
  dataInterface: DataInterface;
}> = ({ renderer, item, mainContent, dataInterface, onCreatedItem }) => {
  const Renderer = renderer;

  return (
    <>
      <Renderer
        menu={{
          childs: [
            {
              text: 'Create new Collection',
              icon: 'folder-new',
              onClick: () => {
                dataInterface
                  .createDataItemUnderParent(
                    {
                      name: 'New Collection',
                      childIds: [],
                      kind: DataItemKind.Collection,
                      lastChange: new Date().getTime(),
                      created: new Date().getTime(),
                      tags: [],
                    } as any,
                    item.id
                  )
                  .then(onCreatedItem);
                TelemetryService?.trackEvent(...TelemetryEvents.Items.createCollection);
              },
            },
            {
              text: 'Create new Note Item',
              icon: 'document',
              onClick: () => {
                dataInterface
                  .createDataItemUnderParent(
                    {
                      name: 'New Note Item',
                      childIds: [],
                      kind: DataItemKind.NoteItem,
                      lastChange: new Date().getTime(),
                      created: new Date().getTime(),
                      tags: [],
                      noteType: 'atlaskit-editor-note',
                    } as any,
                    item.id
                  )
                  .then(onCreatedItem);
                TelemetryService?.trackEvent(...TelemetryEvents.Items.createAtlaskitNote);
              },
            },
            {
              text: 'Create new Code Snippet',
              icon: 'code',
              onClick: () => {
                dataInterface
                  .createDataItemUnderParent(
                    {
                      name: 'New Code Sippet',
                      childIds: [],
                      kind: DataItemKind.NoteItem,
                      lastChange: new Date().getTime(),
                      created: new Date().getTime(),
                      tags: [],
                      noteType: 'monaco-editor-note',
                    } as any,
                    item.id
                  )
                  .then(onCreatedItem);
                TelemetryService?.trackEvent(...TelemetryEvents.Items.createCodeSnippet);
              },
            },
            {
              text: 'Create new Todo List',
              icon: 'tick-circle',
              onClick: () => {
                dataInterface
                  .createDataItemUnderParent(
                    {
                      name: 'New Todo List',
                      childIds: [],
                      kind: DataItemKind.NoteItem,
                      lastChange: new Date().getTime(),
                      created: new Date().getTime(),
                      tags: [],
                      noteType: 'todolist-editor-note',
                    } as any,
                    item.id
                  )
                  .then(onCreatedItem);
                TelemetryService?.trackEvent(...TelemetryEvents.Items.createTodoList);
              },
            },
          ],
        }}
      />
    </>
  );
};
