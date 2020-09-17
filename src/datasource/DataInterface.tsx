import * as React from 'react';
import { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AbstractDataSource } from './AbstractDataSource';
import { DataSourceActionResult, DataItemKind, DataItem, SearchQuery } from '../types';
import { EventEmitter } from '../common/EventEmitter';
import { useAppData } from '../appdata/AppDataProvider';
import { LocalFileSystemDataSource } from './LocalFileSystemDataSource';
import { SearchHelper } from './SearchHelper';
import { arrayIntersection, doArraysIntersect, undup, useAsyncEffect } from '../utils';
import { useEventChangeHandler } from '../common/useEventChangeHandler';
import exp from 'constants';

export const useDataInterface = () => useContext(DataInterfaceContext);

export const useRefreshedSearch = (search: SearchQuery) => {
  const dataInterface = useDataInterface();
  const [refreshedItems, setRefreshedItems] = useState<Array<DataItem<any>>>([]);

  useEffect(() => {
    setRefreshedItems([]);
    dataInterface.search(search, items => setRefreshedItems(oldItems => [...oldItems, ...items]));
  }, [])

  useEventChangeHandler(dataInterface.onChangeItems, async (changes) => {
    const refreshedItemIds = refreshedItems.map(item => item.id);

    const addItems: Array<DataItem<any>> = [];
    const changedItems: Array<DataItem<any>> = [];
    const removeItemIds: Array<string> = [];

    for (const { id: itemId, reason } of changes) {
      const item = await dataInterface.getDataItem(itemId);
      console.log("refresh items,", refreshedItemIds, item, reason)

      if ([ItemChangeEventReason.Created, ItemChangeEventReason.Changed].includes(reason)
        && !refreshedItemIds.includes(itemId)
        && await SearchHelper.satisfiesSearch(item, search, dataInterface)) {
        addItems.push(item);
      } else if ([ItemChangeEventReason.Changed, ItemChangeEventReason.Removed].includes(reason) && refreshedItemIds.includes(itemId)) {
        if (reason === ItemChangeEventReason.Removed || !(await SearchHelper.satisfiesSearch(item, search, dataInterface))) {
          removeItemIds.push(itemId);
        } else {
          changedItems.push(item);
        }
      }
    }

    if (addItems.length || changedItems.length || removeItemIds.length) {
      console.log(addItems, changedItems, removeItemIds)
      setRefreshedItems(i => [
        ...addItems,
        ...i
          .filter(item => !removeItemIds.includes(item.id))
          .map(item => changedItems.find(updatedItem => updatedItem.id === item.id) || item)
      ]);
    }
  }, [search, refreshedItems]);

  return refreshedItems;
};

export const useRefreshedItems = (
  items: DataItem<any>[],
  onChangedItems?: (changedItemIds: string[]) => void,
): [DataItem[], (newItemsOrHandler: DataItem[] | ((oldItems: DataItem[]) => DataItem[])) => void] => {
  const dataInterface = useDataInterface();
  const [initialItems, setInitialItems] = useState(items);
  const [refreshedItems, setRefreshedItems] = useState(items);

  useEffect(() => {
    setInitialItems(items);
  }, [items]);

  useEventChangeHandler(dataInterface.onChangeItems, async changes => {
    const refreshedItemIds = refreshedItems.map(item => item.id);

    let updated: DataItem<any>[] = [];
    let removed: string[] = [];

    for (const { id, reason } of changes) {
      if (refreshedItemIds.includes(id)) {
        const item = refreshedItems.find(i => i.id === id)!;
        const newItem = await dataInterface.getDataItem(id);

        if (newItem) {
          updated.push(newItem);
        } else {
          removed.push(id);
        }
      }
    }

    setRefreshedItems(i =>
      i
        .filter(item => !removed.includes(item.id))
        .map(item => updated.find(updatedItem => updatedItem.id === item.id) || item)
    );
  }, [initialItems, refreshedItems]);


  return [
    refreshedItems,
    (newItemsOrHandler: DataItem[] | ((oldItems: DataItem[]) => DataItem[])) => {
      if (Array.isArray(newItemsOrHandler)) {
        setInitialItems(newItemsOrHandler);
      } else {
        setInitialItems(newItemsOrHandler(refreshedItems));
      }
    }
  ];
};

export const useTreeStructure = (rootItems: Array<string | DataItem>, initiallyExpanded: string[] = []) => {
  const dataInterface = useDataInterface();
  const [items, setItems] = useState<DataItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>(initiallyExpanded);
  const rootItemIds = rootItems.map(item => typeof item === 'string' ? item : item.id); // TODO maybe not neccessary or better implemented otherwise more efficiently?

  useAsyncEffect(async () => {
    console.log("Reload root items")
    const loadedRootItems = await Promise.all<DataItem>(rootItems.map(rootItem => typeof rootItem === 'string' ? dataInterface.getDataItem(rootItem) : new Promise(r => r(rootItem))));
    const loadedRootItemIds = loadedRootItems.map(item => item.id);

    setItems(i => [
      ...i.filter(item => !loadedRootItemIds.includes(item.id)),
      ...loadedRootItems
    ]);
  }, [rootItems]);

  useEventChangeHandler(dataInterface.onChangeItems, async changes => {
    const itemIds = items.map(item => item.id);
    let updated: DataItem[] = [];
    let removed: string[] = [];
    let added: DataItem[] = [];

    for (const { id, reason } of changes) {
      if (itemIds.includes(id)) {
        if (reason === ItemChangeEventReason.Removed) {
          removed.push(id);
        } else if (reason === ItemChangeEventReason.Changed) {
          updated.push(await dataInterface.getDataItem(id));
        }
      } else if (reason === ItemChangeEventReason.Created) {
        const changedItem = await dataInterface.getDataItem(id);
        const changedItemParents = await dataInterface.searchImmediate({ childs: [changedItem.id] });
        const itemIdsToChange = arrayIntersection(changedItemParents.map(i => i.id), itemIds);
        const itemsToChange = await Promise.all(itemIdsToChange.map(id => dataInterface.getDataItem(id)));
        updated.push(...itemsToChange);
        if (itemIdsToChange.length) {
          added.push(changedItem);
        }
      }
    }

    // TODO deleting root items crashes

    console.groupCollapsed("Tree update summary:")
    console.log("  Previously contained ids: ", itemIds)
    console.log("  Changes processed: ", changes)
    console.log("  Updated items: ", updated)
    console.log("  Removed items: ", removed)
    console.log("  Added items: ", added)
    console.log("  Total items before: ", items.length)

    if (removed.length || updated.length || added.length) {
      setItems(i => [
        ...i
          .filter(item => !removed.includes(item.id))
          .filter(item => {
            // const removedDueToNoParent = !i.find(potentialParent => potentialParent.childIds.includes(item.id));
            const removedDueToNoParent = i.find(potentialParent => potentialParent.childIds.includes(item.id));
            return rootItemIds.includes(item.id) || removedDueToNoParent
            // if (removedDueToNoParent) console.log("Removed due to no parent")
            // return removedDueToNoParent;
          })
          .map(item => updated.find(updatedItem => updatedItem.id === item.id) || item),
        ...added
      ]);
      console.log("  New item structure:", items);
    }

    if (removed.length && doArraysIntersect(removed, expandedIds)) { // TODO properly handle
      setExpandedIds(ids => ids.filter(id => !removed.includes(id)));
    }
    console.groupEnd();
  }, [rootItems, items, dataInterface]);

  const expand = useCallback(async (id: string) => {
    console.log("EXPAND")
    const childs = await dataInterface.searchImmediate({ parents: [id] });
    const childIds = childs.map(child => child.id);
    setItems(items => [...items.filter(item => !childIds.includes(item.id)), ...childs]);
    setExpandedIds(ids => [...ids, id]);
  }, [dataInterface]);

  const collapse = useCallback(async (id: string) => {
    console.log("COLLAPSE")
    setExpandedIds(ids => ids.filter(id2 => id2 !== id));
  }, []);

  return { items, expandedIds, expand, collapse };
}

export const DataInterfaceContext = React.createContext<DataInterface>(null as any);

export const DataInterfaceProvider: React.FC = props => {
  const appData = useAppData();
  const [dataInterface, setDataInterface] = useState<DataInterface | null>(null);

  useEffect(() => {
    console.log(appData)
    if (appData.currentWorkspace) {
      const di = new DataInterface(new LocalFileSystemDataSource(appData.currentWorkspace.dataSourceOptions));
      di.load().then(() => setDataInterface(di));
    }
  }, [appData.currentWorkspace])

  return (
    <DataInterfaceContext.Provider value={dataInterface!}>
      { dataInterface && props.children }
    </DataInterfaceContext.Provider>
  )
}

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
