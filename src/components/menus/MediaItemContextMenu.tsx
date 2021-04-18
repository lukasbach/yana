import * as React from 'react';
import { DataItem, MediaItem } from '../../types';
import { MenuRenderer } from './types';
import { MainContentContextType } from '../mainContent/context';
import { DataInterface } from '../../datasource/DataInterface';
import { createDeletionItems, createOpenItems, createOrganizeItems, createRenameItems } from './commonItems';
import { OverlaySearchContextValue } from '../overlaySearch/OverlaySearchProvider';

export const MediaItemContextMenu: React.FC<{
  item: MediaItem;
  renderer: MenuRenderer;
  onStartRename?: () => void;
  onCreatedItem?: (item: DataItem) => void;
  mainContent: MainContentContextType;
  dataInterface: DataInterface;
  overlaySearch: OverlaySearchContextValue;
}> = ({ renderer, item, onStartRename, dataInterface, mainContent, overlaySearch }) => {
  const Renderer = renderer;

  return (
    <Renderer
      menu={{
        childs: [
          ...createOpenItems(mainContent, item, 'document-open'),
          ...createRenameItems(item, dataInterface, onStartRename),
          'divider',
          ...createOrganizeItems(dataInterface, overlaySearch, item),
          'divider',
          ...createDeletionItems(dataInterface, item),
        ],
      }}
    />
  );
};
