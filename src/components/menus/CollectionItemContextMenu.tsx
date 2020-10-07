import * as React from 'react';
import { CollectionDataItem, DataItem, DataItemKind } from '../../types';
import { MenuRenderer } from './types';
import { MainContentContextType, useMainContentContext } from '../mainContent/context';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { Alerter } from '../Alerter';
import { DataInterface } from '../../datasource/DataInterface';

export const CollectionItemContextMenu: React.FC<{
  item: CollectionDataItem;
  renderer: MenuRenderer;
  onStartRename?: () => void;
  onCreatedItem?: (item: DataItem) => void;
  mainContent: MainContentContextType;
  dataInterface: DataInterface;
}> = ({ renderer, item, onStartRename, mainContent, dataInterface, onCreatedItem }) => {
  const Renderer = renderer;

  return (
    <>
      <Renderer
        menu={{
          childs: [
            { text: 'Open', icon: 'folder-open', onClick: () => mainContent.openInCurrentTab(item)  },
            { text: 'Open in new Tab', icon: 'folder-open', onClick: () => mainContent.newTab(item)  },
            { text: 'Rename', icon: 'edit', onClick: onStartRename ?? (() => Alerter.Instance.alert({
              content: <>Rename item <b>{item.name}</b>:</>,
              prompt: {
                defaultValue: item.name,
                placeholder: item.name,
                onConfirmText: name => !!name.length && dataInterface.changeItem(item.id, { name })
              },
              icon: 'edit',
              cancelButtonText: 'Cancel',
              confirmButtonText: 'Rename'
            })) },
            'divider',
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
            'divider',
            { text: 'Delete', icon: 'trash', intent: 'danger', onClick: () => Alerter.Instance.alert({
              content: <>Are you sure you want to delete <b>{item.name}</b>?</>,
              onConfirm: () => dataInterface.removeItem(item.id),
              intent: 'danger',
              icon: 'trash',
              cancelButtonText: 'Cancel',
              confirmButtonText: 'Delete'
              })
            },
          ]
        }}
      />
    </>
  );
};
