import * as React from 'react';
import { CollectionDataItem, DataItem } from '../../types';
import { MenuRenderer } from './types';
import { MainContentContextType } from '../mainContent/context';
import { DataInterface } from '../../datasource/DataInterface';
import {
  createDeletionItems,
  createMetaItems,
  createNewChildsItems,
  createOpenItems,
  createOrganizeItems,
  createRenameItems,
} from './commonItems';
import { OverlaySearchContextValue } from '../overlaySearch/OverlaySearchProvider';

export const CollectionItemContextMenu: React.FC<{
  item: CollectionDataItem;
  renderer: MenuRenderer;
  onStartRename?: () => void;
  onCreatedItem?: (item: DataItem) => void;
  mainContent: MainContentContextType;
  dataInterface: DataInterface;
  overlaySearch: OverlaySearchContextValue;
}> = ({ renderer, item, onStartRename, mainContent, dataInterface, onCreatedItem, overlaySearch }) => {
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
          ...createMetaItems(dataInterface, item),
          'divider',
          ...createOrganizeItems(dataInterface, overlaySearch, item),
          'divider',
          ...createDeletionItems(dataInterface, item),
        ],
      }}
    />
  );
};
