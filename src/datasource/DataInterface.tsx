import * as React from 'react';
import { useContext, useState, useEffect, useRef } from 'react';
import { AbstractDataSource } from './AbstractDataSource';
import { DataSourceActionResult, DataItemKind, DataItem, SearchQuery } from '../types';
import { EventEmitter } from '../common/EventEmitter';
import { useAppData } from '../appdata/AppDataProvider';
import { LocalFileSystemDataSource } from './LocalFileSystemDataSource';
import { SearchHelper } from './SearchHelper';
import { arrayIntersection, doArraysIntersect, undup } from '../utils';

export const useDataInterface = () => useContext(DataInterfaceContext);

export const useRefreshedSearch = (search: SearchQuery) => {
  const dataInterface = useDataInterface();
  const [refreshedItems, setRefreshedItems] = useState<Array<DataItem<any>>>([]);
  const [eventHandler, setEventHandler] = useState<undefined | number>();

  useEffect(() => {
    setInterval(() => console.log(refreshedItems), 2000)
    console.log(1, search)
    setRefreshedItems([]);
    dataInterface.search(search, items => setRefreshedItems(oldItems => [...oldItems, ...items]));

    if (eventHandler) {
      dataInterface.onChangeItems.delete(eventHandler);
    }

    const handler = dataInterface.onChangeItems.on(async (changes) => {
      const refreshedItemIds = refreshedItems.map(item => item.id);

      const addItems: Array<DataItem<any>> = [];
      const changedItems: Array<DataItem<any>> = [];
      const removeItemIds: Array<string> = [];

      for (const { id: itemId, reason } of changes) {
        const item = await dataInterface.getDataItem(itemId);
        console.log("!!===!", item, refreshedItems)

        if ([ItemChangeEventReason.Created, ItemChangeEventReason.Changed].includes(reason)
          && !refreshedItemIds.includes(itemId)
          && await SearchHelper.satisfiesSearch(item, search, dataInterface)) {
          console.log("useRefreshedSearch:addItems")
          addItems.push(item);
        } else if ([ItemChangeEventReason.Changed, ItemChangeEventReason.Removed].includes(reason) && refreshedItemIds.includes(itemId)) {
          if (reason === ItemChangeEventReason.Removed || !(await SearchHelper.satisfiesSearch(item, search, dataInterface))) {
            console.log("useRefreshedSearch:removeItemIds")
            removeItemIds.push(item.id);
          } else {
            console.log("useRefreshedSearch:changedItems")
            changedItems.push(item);
          }
        }
      }

      if (addItems.length || changedItems.length || removeItemIds.length) {
        setRefreshedItems(i => [
          ...addItems,
          ...i
            .filter(item => !removeItemIds.includes(item.id))
            .map(item => changedItems.find(updatedItem => updatedItem.id === item.id) || item)
        ]);
      }
    });

    setEventHandler(handler);

    return () => {
      if (eventHandler) {
        dataInterface.onChangeItems.delete(eventHandler);
      }
    }
  }, []); // TODO search

  return refreshedItems;
};

export const useRefreshedItems = (
  items: DataItem<any>[],
  onChangedItems?: (changedItemIds: string[]) => void,
): [DataItem[], (newItemsOrHandler: DataItem[] | ((oldItems: DataItem[]) => DataItem[])) => void] => {
  const dataInterface = useDataInterface();
  const [initialItems, setInitialItems] = useState(items);
  const [refreshedItems, setRefreshedItems] = useState(items);
  const [eventHandler, setEventHandler] = useState<undefined | number>();

  useEffect(() => {
    setInitialItems(items);
  }, [items]);

  useEffect(() => {
    console.log(11, initialItems)
    if (eventHandler) {
      dataInterface.onChangeItems.delete(eventHandler);
    }

   setRefreshedItems(initialItems);

    const handler = dataInterface.onChangeItems.on(async changes => {
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

      // TODO onChangedItems?.(changes); needed?
    });

    setEventHandler(handler);

    return () => {
      if (eventHandler) {
        dataInterface.onChangeItems.delete(eventHandler);
      }
    }
  }, [initialItems]);

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
  const [eventHandler, setEventHandler] = useState<undefined | number>();
  console.log("???", items)

  useEffect(() => {
    Promise.all<DataItem>(rootItems.map(rootItem => typeof rootItem === 'string' ? dataInterface.getDataItem(rootItem) : new Promise(r => r(rootItem)))).then(setItems);
  }, [rootItems]);

  useEffect(() => {
    if (eventHandler) {
      dataInterface.onChangeItems.delete(eventHandler);
    }

    const handler = dataInterface.onChangeItems.on(async changes => {
      const itemIds = items.map(item => item.id);
      let updated: DataItem[] = [];
      let removed: string[] = [];
      let added: DataItem[] = [];

      for (const { id, reason } of changes) {
        if (itemIds.includes(id)) {
          if (reason === ItemChangeEventReason.Removed) {
            console.log("Existing Item was removed")
            removed.push(id);
          } else if (reason === ItemChangeEventReason.Changed) {
            console.log("Existing Item was updated")
            updated.push(await dataInterface.getDataItem(id));
            // const childs = await dataInterface.searchImmediate({ parents: [id] });
            // const newChilds = childs.filter(child => !itemIds.includes(child.id));
            // added.push(...newChilds);
          }
        } else if (reason === ItemChangeEventReason.Created) {
          console.log("Item was added")
          const changedItem = await dataInterface.getDataItem(id);
          const changedItemParents = await dataInterface.searchImmediate({ parents: [changedItem.id] });
          const itemIdsToChange = arrayIntersection(changedItemParents.map(i => i.id), itemIds);
          const itemsToChange = await Promise.all(itemIdsToChange.map(id => dataInterface.getDataItem(id)));
          updated.push(...itemsToChange);
          if (itemIdsToChange.length) {
            added.push(changedItem);
          }
        }
      }

      console.log("Tree update summary:")
      console.log("  Updated items: ", updated)
      console.log("  Removed items: ", removed)
      console.log("  Added items: ", added)

      setItems(i => [
        ...i
          .filter(item => !removed.includes(item.id))
          .map(item => updated.find(updatedItem => updatedItem.id === item.id) || item),
        ...added
      ]);
    });

    setEventHandler(handler);

    return () => {
      if (eventHandler) {
        dataInterface.onChangeItems.delete(eventHandler);
      }
    }
  }, [rootItems, items]);

  return {
    items,
    expandedIds,
    expand: async (id: string) => {
      const childs = await dataInterface.searchImmediate({ parents: [id] });
      const childIds = childs.map(child => child.id);
      setItems(items => [...items.filter(item => !childIds.includes(item.id)), ...childs]);
      setExpandedIds(ids => [...ids, id]);
    },
    collapse: async (id: string) => {
      setExpandedIds(ids => ids.filter(id2 => id2 !== id));
    }
  };
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
  Created,
  ChangedNoteContents,
  Removed,
  Changed
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

    const result = await this.dataSource.createDataItem<K>(item);
    await this.dataSource.changeItem(parentId, {...parent, childIds: [...parent.childIds, result.id]});
    this.onChangeItems.emit([{ id: result.id, reason: ItemChangeEventReason.Created }]);
    this.onChangeItems.emit([{ id: parentId, reason: ItemChangeEventReason.Changed }]);
    return result;
  }

  public async removeItem(id: string): Promise<DataSourceActionResult> {
    const result = await this.dataSource.removeItem(id);
    this.updateCache(id, undefined);
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
