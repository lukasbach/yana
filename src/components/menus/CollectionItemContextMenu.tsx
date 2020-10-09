import * as React from 'react';
import { CollectionDataItem, DataItem } from '../../types';
import { MenuRenderer } from './types';
import { MainContentContextType } from '../mainContent/context';
import { DataInterface } from '../../datasource/DataInterface';
import { createDeletionItems, createNewChildsItems, createOpenItems, createRenameItems } from './commonItems';

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
    <Renderer
      menu={{
        childs: [
          ...createOpenItems(mainContent, item, 'folder-open'),
          ...createRenameItems(item, dataInterface, onStartRename),
          'divider',
          ...createNewChildsItems(item, dataInterface, onCreatedItem),
          'divider',
          ...createDeletionItems(dataInterface, item),
        ]
      }}
    />
  );
};
