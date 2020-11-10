import { DataItem, SearchQuery } from '../types';
import { useEffect, useRef, useState } from 'react';
import { useEventChangeHandler } from '../common/useEventChangeHandler';
import { SearchHelper } from './SearchHelper';
import { ItemChangeEventReason} from './DataInterface';
import { useDataInterface } from './DataInterfaceContext';
import { LogService } from '../common/LogService';
import { useAsyncEffect } from '../utils';

const logger = LogService.getLogger('useDataSearch');

export const useDataSearch = (search: SearchQuery, pagingSize?: number) => {
  const dataInterface = useDataInterface();
  const [refreshedItems, setRefreshedItems] = useState<Array<DataItem<any>>>([]);
  const refreshedItemIds = refreshedItems.map(item => item.id);
  const [nextPagingValue, setNextPagingValue] = useState<undefined | string | number>();
  const [nextPageAvailable, setNextPageAvailable] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const fetchLock = useRef(false);

  const limit = pagingSize ?? search.limit;

  const fetchNextPage = async (force = false) => {
    if (force || (nextPageAvailable && !fetchLock.current)) {
      setIsFetching(true);
      fetchLock.current = true;
      const result = await dataInterface.search({ ...search, limit, pagingValue: !force ? nextPagingValue : undefined });
      setRefreshedItems(oldItems => [...oldItems, ...result.results]);
      setNextPagingValue(result.nextPagingValue);
      setNextPageAvailable(result.nextPageAvailable);
      setIsFetching(false);
      fetchLock.current = false;
    }
  }

  useAsyncEffect(async () => {
    logger.log('search query changed', [JSON.stringify(search)], {refreshedItems, search})
    setRefreshedItems([]);
    setNextPageAvailable(true);
    setNextPagingValue(undefined);
    await fetchNextPage(true);
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

  return {
    items: refreshedItems,
    nextPageAvailable,
    fetchNextPage,
    isFetching
  };
};
