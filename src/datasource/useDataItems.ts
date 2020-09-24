import { DataItem } from '../types';
import { useEffect, useState } from 'react';
import { useEventChangeHandler } from '../common/useEventChangeHandler';
import { useDataInterface } from './DataInterfaceContext';

export const useDataItems = (
  items: DataItem[],
  onChangedItems?: (changedItemIds: string[]) => void,
): [DataItem[],] => {
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
  ];
};