import { DataItem, SearchQuery } from '../types';
import { useEffect, useState } from 'react';
import { useEventChangeHandler } from '../common/useEventChangeHandler';
import { SearchHelper } from './SearchHelper';
import { ItemChangeEventReason} from './DataInterface';
import { useDataInterface } from './DataInterfaceContext';

export const useDataSearch = (search: SearchQuery) => {
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
