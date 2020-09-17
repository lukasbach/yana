import * as React from 'react';
import { AbstractDataSource } from './AbstractDataSource';
import { DataItem, DataItemKind, DataSourceActionResult, SearchQuery } from '../types';
import { EventEmitter } from '../common/EventEmitter';

export enum ItemChangeEventReason {
  Created = 'created',
  ChangedNoteContents = 'changed_contents',
  Removed = 'removed',
  Changed = 'changed'
}

export interface ItemChangeEvent {
  id: string;
  reason: ItemChangeEventReason;
}

export class DataInterface implements AbstractDataSource {
  private cache: { [key: string]: any } = {};
  private cachedKeys: string[] = [];
  private cachedKeysIt = 0;

  public onChangeItems = new EventEmitter<ItemChangeEvent[]>();

  constructor(public dataSource: AbstractDataSource, private cacheLength: number = 50) {}

  public async load() {
    await this.dataSource.load();
    setInterval(() => this.dataSource.persist(), 10000);
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

  private updateCache(id: string, newValue: any) {
    this.cache[id] = newValue;
  }

  public async getDataItem<K extends DataItemKind>(id: string): Promise<DataItem<K>> {
    return await this.tryCache(id, () => this.dataSource.getDataItem(id));
  }

  public async getNoteItemContent<C extends object>(id: string): Promise<C> {
    return await this.dataSource.getNoteItemContent<C>(id);
  }

  public async writeNoteItemContent<C extends object>(id: string, content: C): Promise<DataSourceActionResult> {
    const result = await this.dataSource.writeNoteItemContent<C>(id, content);
    this.onChangeItems.emit([{ id, reason: ItemChangeEventReason.ChangedNoteContents }]);
    return result;
  }

  public async createDataItem<K extends DataItemKind>(item: Omit<DataItem<K>, 'id'>): Promise<DataItem<K>> {
    const result = await this.dataSource.createDataItem<K>(item);
    this.onChangeItems.emit([{ id: result.id, reason: ItemChangeEventReason.Created }]);
    return result;
  }

  public async createDataItemUnderParent<K extends DataItemKind>(item: Omit<DataItem<K>, 'id'>, parentId: string): Promise<DataItem<K>> {
    const parent = await this.dataSource.getDataItem(parentId);

    if (!parent) {
      throw Error(`Can't create item within parent ${parentId}, parent does not exist.`);
    }

    const itemResult = await this.dataSource.createDataItem<K>(item);
    const overwriteParent = {...parent, childIds: [...parent.childIds, itemResult.id]};
    await this.dataSource.changeItem(parentId, overwriteParent);
    this.updateCache(parentId, overwriteParent);
    this.onChangeItems.emit([{ id: itemResult.id, reason: ItemChangeEventReason.Created }]);
    this.onChangeItems.emit([{ id: parentId, reason: ItemChangeEventReason.Changed }]);
    return itemResult;
  }

  public async removeItem(id: string): Promise<DataSourceActionResult> {
    const result = await this.dataSource.removeItem(id);
    this.updateCache(id, undefined);

    const parents = await this.getParentsOf(id);

    for (const parent of parents) {
      await this.changeItem(parent.id, {
        ...parent,
        childIds: parent.childIds.filter(childId => childId !== id)
      });
    }

    this.onChangeItems.emit([{ id, reason: ItemChangeEventReason.Removed }]);
    return result;
  }

  public async changeItem<K extends DataItemKind>(
    id: string,
    overwriteItem: DataItem<K>
  ): Promise<DataSourceActionResult> {
    const result = await this.dataSource.changeItem(id, overwriteItem);
    this.updateCache(id, overwriteItem);
    this.onChangeItems.emit([{ id, reason: ItemChangeEventReason.Changed }]);
    return result;
  }

  public async search(
    search: SearchQuery,
    onFind: (result: Array<DataItem<any>>) => any
  ): Promise<DataSourceActionResult> {
    return await this.dataSource.search(search, onFind);
  }

  public async searchImmediate(search: SearchQuery): Promise<Array<DataItem>> {
    const items: DataItem[] = [];
    await this.search(search, result => items.push(...result));
    console.log("Search: ", search, items)
    return items;
  }

  public async loadMediaItemContent(id: string): Promise<Buffer | Blob> {
    return await this.dataSource.loadMediaItemContent(id);
  }

  public async persist(): Promise<DataSourceActionResult> {
    return await this.dataSource.persist();
  }

  public async getParentsOf<K extends DataItemKind>(childId: string): Promise<DataItem<K>[]> {
    return await this.dataSource.getParentsOf(childId);
  }

  // TODO bulk operations such as changeItems, removeItems, ...
}
