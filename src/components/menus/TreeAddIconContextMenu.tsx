import * as React from 'react';
import { CollectionDataItem, DataItem, DataItemKind } from '../../types';
import { MenuRenderer } from './types';
import { MainContentContextType } from '../mainContent/context';
import { DataInterface } from '../../datasource/DataInterface';

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
            { text: 'Create new Collection', icon: 'add', onClick: () => {
                dataInterface.createDataItemUnderParent({
                  name: 'New Collection',
                  childIds: [],
                  kind: DataItemKind.Collection,
                  lastChange: new Date().getTime(),
                  created: new Date().getTime(),
                  tags: []
                } as any, item.id).then(onCreatedItem)
              }},
            { text: 'Create new Note Item', icon: 'add', onClick: () => {
              dataInterface.createDataItemUnderParent({
                name: 'New Note Item',
                childIds: [],
                kind: DataItemKind.NoteItem,
                lastChange: new Date().getTime(),
                created: new Date().getTime(),
                tags: [],
                noteType: 'atlaskit-editor-note'
              } as any, item.id).then(onCreatedItem)
            }},
          ]
        }}
      />
    </>
  );
};
