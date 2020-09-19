import { useEffect } from 'react';
import { CollectionDataItem, DataItem, DataItemKind, MediaItem, NoteDataItem } from './types';

export const useAsyncEffect = (effect: () => Promise<any>, deps: any[]) =>
  useEffect(() => {
    effect();
  }, deps);
export const isNoteItem = (dataItem: DataItem<any>): dataItem is NoteDataItem<any> =>
  dataItem.kind === DataItemKind.NoteItem;
export const isMediaItem = (dataItem: DataItem<any>): dataItem is MediaItem => dataItem.kind === DataItemKind.MediaItem;
export const isCollectionItem = (dataItem: DataItem<any>): dataItem is CollectionDataItem =>
  dataItem.kind === DataItemKind.Collection;
export const undup = <T>(arr: T[]) => [...new Set([...arr])];
export const doArraysIntersect = (arr1: any[], arr2: any[]) => arr1.map(item1 => arr2.includes(item1)).reduce((a, b) => a || b, false);
export const arrayIntersection = <T>(arr1: T[], arr2: T[]): T[] => arr1
  .map(item1 => arr2.includes(item1) ? item1 : null)
  .filter(item => item !== null)
  .reduce<T[]>((a, b) => [...a, b!], []);