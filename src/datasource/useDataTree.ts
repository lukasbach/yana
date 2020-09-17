import { DataItem } from '../types';
import { useCallback, useState } from 'react';
import { arrayIntersection, doArraysIntersect, useAsyncEffect } from '../utils';
import { useEventChangeHandler } from '../common/useEventChangeHandler';
import { ItemChangeEventReason} from './DataInterface';
import { useDataInterface } from './DataInterfaceContext';

export const useDataTree = (rootItems: Array<string | DataItem>, initiallyExpanded: string[] = []) => {
  const dataInterface = useDataInterface();
  const [items, setItems] = useState<DataItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>(initiallyExpanded);
  const rootItemIds = rootItems.map(item => typeof item === 'string' ? item : item.id); // TODO maybe not neccessary or better implemented otherwise more efficiently?

  useAsyncEffect(async () => {
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
            const removedDueToNoParent = i.find(potentialParent => potentialParent.childIds.includes(item.id));
            return rootItemIds.includes(item.id) || removedDueToNoParent
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
    const childs = await dataInterface.searchImmediate({ parents: [id] });
    const childIds = childs.map(child => child.id);
    setItems(items => [...items.filter(item => !childIds.includes(item.id)), ...childs]);
    setExpandedIds(ids => [...ids, id]);
  }, [dataInterface]);

  const collapse = useCallback(async (id: string) => {
    setExpandedIds(ids => ids.filter(id2 => id2 !== id));
  }, []);

  return { items, expandedIds, expand, collapse };
}