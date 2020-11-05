import { DataItem, SearchQuery } from '../types';
import { useEffect, useState } from 'react';
import { useEventChangeHandler } from '../common/useEventChangeHandler';
import { SearchHelper } from './SearchHelper';
import { ItemChangeEventReason} from './DataInterface';
import { useDataInterface } from './DataInterfaceContext';
import { LogService } from '../common/LogService';

const logger = LogService.getLogger('useDataSearch');

export const useDataSearch = (search: SearchQuery) => {
  const dataInterface = useDataInterface();
  const [refreshedItems, setRefreshedItems] = useState<Array<DataItem<any>>>([]);
  const refreshedItemIds = refreshedItems.map(item => item.id);

  useEffect(() => {
    logger.log('search query changed', [JSON.stringify(search)], {refreshedItems, search})
    setRefreshedItems([]);
    dataInterface.search(search, items => setRefreshedItems(oldItems => [...oldItems, ...items]));
  }, [JSON.stringify(search)]) // TODO dont stringify? causes infinite loop

  useEventChangeHandler(dataInterface.onChangeItems, async (changes) => {

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
      logger.log('Changes found to current search', [JSON.stringify(search)], {search, addItems, changedItems, removeItemIds, refreshedItems});

      let newItems = [
        ...addItems,
        ...refreshedItems
          .filter(item => !removeItemIds.includes(item.id))
          .map(item => changedItems.find(updatedItem => updatedItem.id === item.id) || item)
      ];

      // TODO if removeItemIds.length>0, and newItems.length<limit, we should do a re-search

      if (search.sortColumn) {
        newItems = newItems.sort((a, b) =>
          SearchHelper.sortItems(a, b, search.sortColumn!, search.sortDirection));
      }

      if (search.limit) {
        newItems = newItems.slice(0, search.limit);
      }

      setRefreshedItems(newItems);
      // TODO using setRefreshedItems(i => ...) doesnt seem to work, as i and refreshedItems dont seem to be up to date. Actually refreshedItems seems to be out of date, but in practice it looks somewhat okay atm
    }
  }, [JSON.stringify(search), refreshedItemIds.join('___')]);

  return refreshedItems;
};
