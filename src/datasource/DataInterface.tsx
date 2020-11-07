import * as React from 'react';
import { AbstractDataSource } from './AbstractDataSource';
import { DataItem, DataItemKind, DataSourceActionResult, MediaItem, SearchQuery } from '../types';
import { EventEmitter } from '../common/EventEmitter';
import type { EditorRegistry } from '../editors/EditorRegistry';
import { isMediaItem, isNoteItem } from '../utils';
import { LogService } from '../common/LogService';
import { DevtoolsContextType } from '../components/devtools/DevToolsContextProvider';

const logger = LogService.getLogger('DataInterface');

export enum ItemChangeEventReason {
  Created = 'created',
  ChangedNoteContents = 'changed_contents',
  Removed = 'removed',
  Changed = 'changed'
}

export interface ItemChangeEvent {
  id: string;
  reason: ItemChangeEventReason;
  // TODO: just send item data with it, its usually available anyways and saves tons of reads
}

export interface FileAddEvent {
  id: string;
  item: MediaItem;
  insertIntoActiveEditor: boolean;
}

export class DataInterface implements AbstractDataSource {
  private cache: { [key: string]: any } = {};
  private cachedKeys: string[] = [];
  private cachedKeysIt = 0;
  private dirty = false;
  private persistInterval?: number;

  public onChangeItems = new EventEmitter<ItemChangeEvent[]>('DataInterface:onChangeItems');
  public onAddFiles = new EventEmitter<FileAddEvent[]>('DataInterface:onAddFiles');

  constructor(
    public dataSource: AbstractDataSource,
    private editors: EditorRegistry,
    private cacheLength: number = 50,
    private devtools?: DevtoolsContextType,
  ) {
    if (devtools) {
      this.onChangeItems.on(() => devtools.increaseCounter('DI onChangeItems'));
      this.onAddFiles.on(() => devtools.increaseCounter('DI onAddFiles'));
    }
  }

  public async load() {
    logger.log("load", [], {dataInterface: this});
    await this.dataSource.load();
    if (!await this.dataSource.getStructure('tags')) {
      await this.dataSource.storeStructure('tags', {});
    }
    this.persistInterval = setInterval(() => this.persist(), 10000) as unknown as number;
  }

  public async reload() {
    logger.log("reload", [], {dataInterface: this});
    await this.dataSource.reload();
  }

  public async unload() {
    logger.log("unload", [], {dataInterface: this});
    await this.dataSource.unload();
    if (this.persistInterval) {
      clearInterval(this.persistInterval);
    }
  }

  private async tryCache<T>(id: string, orFetch: () => Promise<T>) {
    this.devtools?.increaseCounter('DI try cache');
    const cacheItem = this.cache[id];
    if (cacheItem) {
      this.devtools?.increaseCounter('DI cache hit');
      return cacheItem;
    } else {
      this.devtools?.increaseCounter('DI cache miss');
      const item = await orFetch();
      this.cache[id] = item;

      this.cachedKeys[this.cachedKeysIt] = id;

      this.cachedKeysIt++;
      this.cachedKeysIt = this.cachedKeysIt % this.cacheLength;

      if (this.cachedKeys.length >= this.cacheLength) {
        this.devtools?.increaseCounter('DI cache purge');
        delete this.cache[this.cachedKeysIt];
      }

      return item;
    }
  }

  private updateCache(id: string, newValue: any) {
    this.cache[id] = newValue;
  }

  private makeDirty() {
    this.dirty = true;
  }

  public async getDataItem<K extends DataItemKind>(id: string): Promise<DataItem<K>> {
    this.devtools?.increaseCounter('DI getDataItem');
    const item = await this.tryCache(id, () => this.dataSource.getDataItem(id));
    logger.log('Getting item with Id', [id], {item});
    return item;
  }

  public async getNoteItemContent<C extends object>(id: string): Promise<C> {
    this.devtools?.increaseCounter('DI getNoteItemContent');
    return await this.dataSource.getNoteItemContent<C>(id);
  }

  public async writeNoteItemContent<C extends object>(id: string, content: C): Promise<DataSourceActionResult> {
    this.devtools?.increaseCounter('DI writeNoteItemContent');
    const result = await this.dataSource.writeNoteItemContent<C>(id, content);
    logger.out("Writing contents to file for ", [id], {content});
    this.onChangeItems.emit([{ id, reason: ItemChangeEventReason.ChangedNoteContents }]);
    const currentItemContent = await this.getDataItem(id);
    await this.changeItem(id, { ...currentItemContent, lastChange: (new Date()).getTime() });
    return result;
  }

  public async createDataItem<K extends DataItemKind>(item: Omit<DataItem<K>, 'id'>): Promise<DataItem<K>> {
    this.devtools?.increaseCounter('DI createDataItem');
    const result = await this.dataSource.createDataItem<K>(item);
    await this.initializeNoteContent(result);
    this.onChangeItems.emit([{ id: result.id, reason: ItemChangeEventReason.Created }]);
    this.makeDirty();
    return result;
  }

  public async createDataItemUnderParent<K extends DataItemKind>(item: Omit<DataItem<K>, 'id'>, parentId: string): Promise<DataItem<K>> {
    const parent = await this.dataSource.getDataItem(parentId);

    if (!parent) {
      throw Error(`Can't create item within parent ${parentId}, parent does not exist.`);
    }

    const itemResult = await this.dataSource.createDataItem<K>(item);
    await this.initializeNoteContent(itemResult);
    const overwriteParent = {...parent, childIds: [...parent.childIds, itemResult.id]};
    await this.dataSource.changeItem(parentId, overwriteParent);
    this.updateCache(parentId, overwriteParent);
    this.onChangeItems.emit([{ id: itemResult.id, reason: ItemChangeEventReason.Created }]);
    this.onChangeItems.emit([{ id: parentId, reason: ItemChangeEventReason.Changed }]);
    return itemResult;
  }

  public async addDataItemToParent(itemId: string, parentId: string): Promise<DataSourceActionResult> {
    return await this.changeItem(parentId, old => ({ childIds: [...old.childIds, itemId] }));
  }

  public async removeDataItemFromParent(itemId: string, parentId: string): Promise<DataSourceActionResult> {
    return await this.changeItem(parentId, old => ({ childIds: old.childIds.filter(id => id !== itemId) }));
  }

  public async removeItem(id: string, recursive?: boolean): Promise<DataSourceActionResult> {
    this.devtools?.increaseCounter('DI removeItem');
    const data = await this.dataSource.getDataItem(id);

    if (!data) {
      throw Error(`Cannot remove dataitem ${id}, it does not exist.`);
    }

    const result = await this.dataSource.removeItem(id);
    this.updateCache(id, undefined);

    const parents = await this.getParentsOf(id);

    for (const parent of parents) {
      await this.changeItem(parent.id, {
        ...parent,
        childIds: parent.childIds.filter(childId => childId !== id)
      });
    }

    if (isMediaItem(data)) {
      await this.dataSource.removeMediaItemContent(data);
    }

    this.onChangeItems.emit([{ id, reason: ItemChangeEventReason.Removed }]);
    this.makeDirty();

    if (recursive) {
      for (const childId of data.childIds) {
        await this.removeItem(childId, true);
      }
    }

    return result;
  }

  public async moveItem(id: string, originalParentId: string, targetParentId: string, targetIndex: number) {
    this.devtools?.increaseCounter('DI moveItem');
    // const item = await this.getDataItem(id);
    const originalParent = await this.getDataItem(originalParentId);

    await this.changeItem(originalParentId, {
      ...originalParent,
      childIds: originalParent.childIds.filter(childId => id !== childId)
    });

    const targetParent = await this.getDataItem(targetParentId);

    await this.changeItem(targetParentId, {
      ...targetParent,
      childIds: [
        ...targetParent.childIds.filter((childId, index) => index < targetIndex),
        id,
        ...targetParent.childIds.filter((childId, index) => index >= targetIndex),
      ]
    });
  }

  public async changeItem<K extends DataItemKind>(
    id: string,
    overwriteWith: Partial<DataItem<K>> | ((old: DataItem<K>) => Partial<DataItem<K>>)
  ): Promise<DataSourceActionResult> {
    this.devtools?.increaseCounter('DI changeItem');
    const old = await this.dataSource.getDataItem(id) as DataItem<K>;

    if (!old) {
      throw Error(`Dataitem with id ${id} does not exist.`);
    }

    const overwriteItem = typeof overwriteWith === 'function' ? { ...old, ...overwriteWith(old) } : overwriteWith;

    if (overwriteItem.tags && old.tags.sort().toString() !== overwriteItem.tags.sort().toString()) {
      // TODO factor into its own method, use constant for 'tags'
      const removedTags = old.tags.filter(tag => !overwriteItem.tags?.includes(tag));
      const addedTags = overwriteItem.tags.filter(tag => !old.tags.includes(tag));
      const tagsStructure = await this.getStructure('tags');

      for (const removedTag of removedTags) {
        if (tagsStructure[removedTag]) {
          tagsStructure[removedTag].count--;
          if (tagsStructure[removedTag].count === 0) {
            delete tagsStructure[removedTag];
          }
        }
      }

      for (const addedTag of addedTags) {
        if (tagsStructure[addedTag]) {
          tagsStructure[addedTag].count++;
        } else {
          tagsStructure[addedTag] = {
            count: 1
          };
        }
      }

      await this.storeStructure('tags', tagsStructure);
    }

    const completeOverwriteItem = { ...old, ...overwriteItem };
    logger.log('Updating item', [id], { old, update: overwriteItem, newItem: completeOverwriteItem })
    const result = await this.dataSource.changeItem(id, completeOverwriteItem);
    this.updateCache(id, completeOverwriteItem);
    this.onChangeItems.emit([{ id, reason: ItemChangeEventReason.Changed }]);
    this.makeDirty();
    return result;
  }

  public async search(
    search: SearchQuery,
    onFind: (result: Array<DataItem<any>>) => any
  ): Promise<DataSourceActionResult> {
    this.devtools?.increaseCounter('DI search');
    if (Object.keys(search).length === 0) return;
    logger.log("Performing search", [], {search});
    return await this.dataSource.search(search, onFind);
  }

  public async searchImmediate(search: SearchQuery): Promise<Array<DataItem>> {
    this.devtools?.increaseCounter('DI searchImmediate');
    const items: DataItem[] = [];
    await this.search(search, result => items.push(...result));
    logger.out("Performing immediate search", [], { search, items });
    return items;
  }

  public async loadMediaItemContent(id: string): Promise<Buffer | Blob> {
    return await this.dataSource.loadMediaItemContent(id);
  }

  public async loadMediaItemContentAsPath(id: string): Promise<string> {
    return await this.dataSource.loadMediaItemContentAsPath(id);
  }

  public async loadMediaItemContentThumbnailAsPath(id: string): Promise<string | undefined> {
    return await this.dataSource.loadMediaItemContentThumbnailAsPath(id);
  }

  public async storeMediaItemContent(id: string, localPath: string, thumbnail: { width?: number; height?: number } | undefined): Promise<DataSourceActionResult> {
    return await this.dataSource.storeMediaItemContent(id, localPath, thumbnail);
  }

  public removeMediaItemContent(item: MediaItem): Promise<DataSourceActionResult> {
    throw Error('Do not call DataInterface.removeMediaItemContent() directly, DataInterface.removeItem() will delete media data automatically.');
  }

  public async persist(): Promise<DataSourceActionResult> {
    this.devtools?.increaseCounter('DI persist');
    if (this.dirty) {
      logger.log("Persisting", [], {source: this.dataSource});
      this.dirty = false;
      return await this.dataSource.persist();
    } else {
      logger.log("Skipping Persist, not dirty", [], {source: this.dataSource});
    }
  }

  public async getParentsOf<K extends DataItemKind>(childId: string): Promise<DataItem<K>[]> {
    this.devtools?.increaseCounter('DI getParentsOf');
    return await this.dataSource.getParentsOf(childId);
  }

  private async initializeNoteContent(item: DataItem) {
    if (isNoteItem(item)) {
      const editor = this.editors.getEditorWithId(item.noteType);

      if (!editor) {
        throw Error(`Cannot initialize note content, editor ${item.noteType} is unknown.`);
      }

      await this.dataSource.writeNoteItemContent(item.id, editor.initializeContent());
    }
  }

  public async getStructure<K extends any = any>(id: string): Promise<K> {
    this.devtools?.increaseCounter('DI getStructure');
    this.devtools?.increaseCounter('DI getStructure:' + id);
    const structure = await this.dataSource.getStructure(id);
    logger.log('getStructure', [id], {structure});
    return structure; // TODO cache?
  }

  public async storeStructure<K extends any = any>(id: string, structure: K): Promise<DataSourceActionResult> {
    this.devtools?.increaseCounter('DI storeStructure');
    logger.log('storeStructure', [id], {structure});
    this.makeDirty();
    return await this.dataSource.storeStructure(id, structure);
  }

  public async getAvailableTags(): Promise<Array<{ value: string }>> {
    this.devtools?.increaseCounter('DI getAvailableTags');
    console.log("getAvailableTags", await this.getStructure('tags'));
    return Object.entries(await this.getStructure('tags')).map(([value, data]: any) => ({ value, ...data }));
  }

  // TODO bulk operations such as changeItems, removeItems, ...
}
