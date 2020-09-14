import { useEffect } from 'react';
import { CollectionDataItem, DataItem, DataItemKind, MediaItem, NoteDataItem } from './types';

export const useAsyncEffect = (effect: () => Promise<any>, deps: any[]) =>
  useEffect(() => {
    effect();
  }, deps);
export const isNoteItem = (dataItem: DataItem<any>): dataItem is NoteDataItem<any, any> =>
  dataItem.kind === DataItemKind.NoteItem;
export const isMediaItem = (dataItem: DataItem<any>): dataItem is MediaItem => dataItem.kind === DataItemKind.MediaItem;
export const isCollectionItem = (dataItem: DataItem<any>): dataItem is CollectionDataItem =>
  dataItem.kind === DataItemKind.Collection;
