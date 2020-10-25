import { MenuItemDefinition } from './types';
import { MainContentContextType } from '../mainContent/context';
import { CollectionDataItem, DataItem, DataItemKind } from '../../types';
import { Alerter } from '../Alerter';
import * as React from 'react';
import { DataInterface } from '../../datasource/DataInterface';
import { InternalTag } from '../../datasource/InternalTag';
import { undup } from '../../utils';
import { IconName } from '@blueprintjs/core';

export const createOpenItems = (mainContent: MainContentContextType, item: DataItem, icon: IconName): Array<MenuItemDefinition | 'divider'> => ([
  { text: 'Open', icon, onClick: () => mainContent.openInCurrentTab(item)  },
  { text: 'Open in new Tab', icon, onClick: () => mainContent.newTab(item)  },
]);

export const createRenameItems = (item: DataItem, dataInterface: DataInterface, onStartRename?: () => void, ): Array<MenuItemDefinition | 'divider'> => ([
  {
    text: 'Rename',
    icon: 'edit',
    onClick: onStartRename ?? (() => Alerter.Instance.alert({
      content: <>Rename item <b>{item.name}</b>:</>,
      prompt: {
        defaultValue: item.name,
        placeholder: item.name,
        onConfirmText: name => !!name.length && dataInterface.changeItem(item.id, { name })
      },
      icon: 'edit',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Rename'
    }))
  },
]);

export const createNewChildsItems = (item: DataItem, dataInterface: DataInterface, onCreatedItem?: (item: DataItem) => void): Array<MenuItemDefinition | 'divider'> => ([
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
  { text: 'Create new Code Snippet', icon: 'add', onClick: () => {
      dataInterface.createDataItemUnderParent({
        name: 'New Code Item',
        childIds: [],
        kind: DataItemKind.NoteItem,
        lastChange: new Date().getTime(),
        created: new Date().getTime(),
        tags: [],
        noteType: 'monaco-editor-note'
      } as any, item.id).then(onCreatedItem)
    }},
]);

export const createDeletionItems = (dataInterface: DataInterface, item: DataItem): Array<MenuItemDefinition | 'divider'> => (
  item.tags.includes(InternalTag.Trash) ? [
    { text: 'Restore', icon: 'history',
      onClick: async () => await dataInterface.changeItem(item.id, old =>
        ({ tags: old.tags.filter(tag => tag !== InternalTag.Trash) }))
    },
    'divider',
    { text: 'Delete forever', icon: 'trash', intent: 'danger', onClick: () => Alerter.Instance.alert({
        content: <>Are you sure you want to delete <b>{item.name}</b>?</>,
        onConfirm: () => dataInterface.removeItem(item.id),
        intent: 'danger',
        icon: 'trash',
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Delete'
      })
    },
  ] : [
    {
      text: 'Move to trash', icon: 'trash', intent: 'danger',
      onClick: async () => await dataInterface.changeItem(item.id, old =>
        ({ tags: undup([...old.tags, InternalTag.Trash]) }))
    }
  ]
);
