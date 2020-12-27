import { DataItem } from '../types';
import { useEffect, useState } from 'react';
import { useEventChangeHandler } from '../common/useEventChangeHandler';
import { useDataInterface } from './DataInterfaceContext';
import { LogService } from '../common/LogService';

const logger = LogService.getLogger('useDataItems');

export const useDataItems = (
  items: DataItem[],
  onChangedItems?: (changedItemIds: string[]) => void,
): [DataItem[],] => {
  const dataInterface = useDataInterface();
  const [refreshedItems, setRefreshedItems] = useState(items);

  useEffect(() => {
    if (items.length > 0) {
      logger.log("initial items changed", [], {items})
      setRefreshedItems(items);
    }
  }, [items]);

  useEventChangeHandler(dataInterface.onChangeItems, async changes => {
    const refreshedItemIds = refreshedItems.map(item => item.id);

    let updated: DataItem<any>[] = [];
    let removed: string[] = [];

    for (const { id, reason } of changes) {
      if (refreshedItemIds.includes(id)) {
        const newItem = await dataInterface.getDataItem(id);

        if (newItem) {
          updated.push(newItem);
        } else {
          removed.push(id);
        }
      }
    }

    if (updated.length || removed.length) {
      logger.log("Changes found to current data items", [], {updated, removed, refreshedItems, items})
      setRefreshedItems(i =>
        i
          .filter(item => !removed.includes(item.id))
          .map(item => updated.find(updatedItem => updatedItem.id === item.id) || item)
      );
    }
  }, [items, refreshedItems]);


  return [
    refreshedItems,
  ];
};