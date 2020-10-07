import * as React from 'react';
import { DataItem, NoteDataItem } from '../../types';
import { MenuRenderer } from './types';
import { isCollectionItem, isMediaItem, isNoteItem } from '../../utils';
import { CollectionItemContextMenu } from './CollectionItemContextMenu';
import { NoteItemContextMenu } from './NoteItemContextMenu';
import { MainContentContextType } from '../mainContent/context';
import { DataInterface } from '../../datasource/DataInterface';
import { MediaItemContextMenu } from './MediaItemContextMenu';

export const DataItemContextMenu: React.FC<{
  item: DataItem;
  renderer: MenuRenderer;
  onStartRename?: () => void;
  onCreatedItem?: (item: DataItem) => void;
  mainContent: MainContentContextType;
  dataInterface: DataInterface;
}> = props => {
  if (isNoteItem(props.item)) {
    return <NoteItemContextMenu {...props} item={props.item} />;
  } else if (isCollectionItem(props.item)) {
    return <CollectionItemContextMenu {...props} item={props.item} />;
  } else if (isMediaItem(props.item)) {
    return <MediaItemContextMenu {...props} item={props.item} />;
  } else {
    return null;
  }
};
