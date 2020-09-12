import { AbstractDataSource } from './AbstractDataSource';
import {
  DataSourceActionResult,
  IdentifiableItemKind,
  MediaItem,
  NamedIdentifiableItem,
  NoteItem, NoteItemCollection,
  SearchQuery,
} from '../types';
import React, { useContext, useEffect, useState } from 'react';
import { EventEmitter } from '../common/EventEmitter';

export const useRefreshedItems = (items: NamedIdentifiableItem<any>[]) => {
  const dataInterface = useContext(DataInterfaceContext);
  const [refreshedItems, setRefreshedItems] = useState(items);
  const refreshedItemIds = refreshedItems.map(item => item.id);

  useEffect(() => {
    dataInterface.onChangeItems.on(async (ids) => {
      let updated: NamedIdentifiableItem<any>[] = [];

      for (const id of ids) {
        if (refreshedItemIds.includes(id)) {
          const item = refreshedItems.find(i => i.id === id)!;

          switch (item.kind) {
            case IdentifiableItemKind.NoteItem:
              updated.push(await dataInterface.dataSource.getNoteItem(id)); // TODO use dataInterface directly, caching!
              break;
            case IdentifiableItemKind.Collection:
              updated.push(await dataInterface.dataSource.getCollection(id)); // TODO use dataInterface directly, caching!
              break;
            case IdentifiableItemKind.MediaItem:
              updated.push(await dataInterface.dataSource.getMediaItem(id)); // TODO use dataInterface directly, caching!
              break;
          }
        }
      }

      setRefreshedItems(i => i.map(item =>
        updated.find(updatedItem => updatedItem.id === item.id) || item));
    })
  }, [items]);

  return refreshedItems;
}

export const DataInterfaceContext = React.createContext<DataInterface>(null as any);

export class DataInterface implements AbstractDataSource {
  private cache: { [key: string]: any } = {};
  private cachedKeys: string[] = [];
  private cachedKeysIt = 0;

  public onChangeItems = new EventEmitter<string[]>();

  constructor(public dataSource: AbstractDataSource, private cacheLength: number) {

  }

  public async load() {
    await this.dataSource.load();
  }

  private async tryCache<T>(id: string, orFetch: () => Promise<T>) {
    const cacheItem = this.cache[id];
    if (cacheItem) {
      return cacheItem;
    } else {
      const item = await orFetch();
      this.cache[id] = item;

      this.cachedKeys[this.cachedKeysIt] = id;

      this.cachedKeysIt++;
      this.cachedKeysIt = this.cachedKeysIt % this.cacheLength;

      if (this.cachedKeys.length >= this.cacheLength) {
        delete this.cache[this.cachedKeysIt];
      }

      return item;
    }
  }

  private async updateCache(id: string, newValue: any) {
    this.cache[id] = newValue;
  }

  public changeItem(id: string, overwriteItem: NoteItem<any, any>): Promise<DataSourceActionResult> {
    return Promise.resolve(undefined);
  }

  public changeItemTags(id: string, tags: string[]): Promise<DataSourceActionResult> {
    return Promise.resolve(undefined);
  }

  public createCollection(name: string): Promise<NoteItemCollection> {
    return Promise.resolve(undefined);
  }

  public createNoteItem<T, C>(item: Omit<NoteItem<T, C>, "id">): Promise<NoteItem<T, C>> {
    return Promise.resolve(undefined);
  }

  public getCollection(id: string): Promise<NoteItemCollection> {
    return Promise.resolve(undefined);
  }

  public getMediaItem(id: string): Promise<MediaItem> {
    return Promise.resolve(undefined);
  }

  public getNoteItem<T, C>(id: string): Promise<Omit<NoteItem<T, C>, "content">> {
    return Promise.resolve(undefined);
  }

  public getNoteItemContent<T, C>(id: string): Promise<NoteItem<T, C>> {
    return Promise.resolve(undefined);
  }

  public loadMediaItemContent(id: string): Promise<Buffer | Blob> {
    return Promise.resolve(undefined);
  }

  public persist(): Promise<DataSourceActionResult> {
    return Promise.resolve(undefined);
  }

  public removeItem(id: string): Promise<DataSourceActionResult> {
    return Promise.resolve(undefined);
  }

  public renameItem(id: string, newName: string): Promise<DataSourceActionResult> {
    return Promise.resolve(undefined);
  }

  public search(search: SearchQuery, onFind: (collections: Array<Omit<NoteItem<any, any>, "content"> | NoteItemCollection | MediaItem>) => any): Promise<DataSourceActionResult> {
    return Promise.resolve(undefined);
  }
}