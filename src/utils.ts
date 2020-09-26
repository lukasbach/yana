import { useEffect } from 'react';
import { CollectionDataItem, DataItem, DataItemKind, MediaItem, NoteDataItem, SearchQuery } from './types';

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
export const mergeSearchQueries = (sq1: SearchQuery, sq2: SearchQuery): SearchQuery => ({
  parents: (sq1.parents || sq2.parents) && undup([...(sq1.parents || []), ...(sq2.parents || [])]),
  exactParents: (sq1.exactParents || sq2.exactParents) && undup([...(sq1.exactParents || []), ...(sq2.exactParents || [])]),
  childs: (sq1.childs || sq2.childs) && undup([...(sq1.childs || []), ...(sq2.childs || [])]),
  contains: (sq1.contains || sq2.contains) && undup([...(sq1.contains || []), ...(sq2.contains || [])]),
  tags: (sq1.tags || sq2.tags) && undup([...(sq1.tags || []), ...(sq2.tags || [])]),
  kind: sq2.kind || sq1.kind,
});
