import { DataItem } from '../types';
import { useCallback, useState } from 'react';
import { arrayIntersection, doArraysIntersect, useAsyncEffect } from '../utils';
import { useEventChangeHandler } from '../common/useEventChangeHandler';
import { ItemChangeEventReason} from './DataInterface';
import { useDataInterface } from './DataInterfaceContext';
import { LogService } from '../common/LogService';
import { InternalTag } from './InternalTag';

const logger = LogService.getLogger('useDataTree');

export const useDataTree = (rootItems: Array<string | DataItem>, initiallyExpanded: string[] = []) => {
  const dataInterface = useDataInterface();
  const [items, setItems] = useState<DataItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>(initiallyExpanded);
  const [oldRootItemIds, setOldRootItemIds] = useState<string[]>([]);
  const rootItemIds = rootItems.map(item => typeof item === 'string' ? item : item.id); // TODO maybe not neccessary or better implemented otherwise more efficiently?

  useAsyncEffect(async () => {
    const loadedRootItems = await Promise.all<DataItem>(rootItems.map(rootItem => typeof rootItem === 'string'
      ? dataInterface.getDataItem(rootItem)
      : new Promise(r => r(rootItem))));
    const loadedRootItemIds = loadedRootItems.map(item => item.id);

    logger.log("rootItems changed", [], { loadedRootItemIds, loadedRootItems, items, rootItems });

    setItems(i => [
      ...i.filter(item => !loadedRootItemIds.includes(item.id) && !(oldRootItemIds.includes(item.id) && !rootItemIds.includes(item.id))),
      ...loadedRootItems
    ]);
    setOldRootItemIds(loadedRootItemIds);
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
          const missingChildIds = updated
            .map(item => item.childIds)
            .reduce((a, b) => [...a, ...b], [])
            .filter(id => !itemIds.includes(id));
          for (const id of missingChildIds) {
            const item = await dataInterface.getDataItem(id);
            if (item) {
              added.push(item); // TODO verify
            }
          }
        }
      } else if (reason === ItemChangeEventReason.Created) {
        const changedItem = await dataInterface.getDataItem(id);
        const { results: changedItemParents } = await dataInterface.search({ childs: [changedItem.id] });
        const itemIdsToChange = arrayIntersection(changedItemParents.map(i => i.id), itemIds);
        const itemsToChange = await Promise.all(itemIdsToChange.map(id => dataInterface.getDataItem(id)));
        updated.push(...itemsToChange);
        if (itemIdsToChange.length) {
          added.push(changedItem);
        }
      }
    }

    let changedItemStructure: DataItem[] = [];

    if (removed.length || updated.length || added.length) {
      setItems(i => {
        changedItemStructure = [
          ...i
            .filter(item => !removed.includes(item.id))
            .map(item => updated.find(updatedItem => updatedItem.id === item.id) || item),
          ...added
        ];

        changedItemStructure = changedItemStructure.filter(item => {
          const removedDueToNoParent = changedItemStructure.find(potentialParent => potentialParent?.childIds.includes(item.id));
          return changedItemStructure.map(item => item.id).includes(item.id) || removedDueToNoParent;
        })

        return changedItemStructure;
      });
    }

    if (removed.length && doArraysIntersect(removed, expandedIds)) { // TODO properly handle
      setExpandedIds(ids => ids.filter(id => !removed.includes(id)));
    }

    logger.out(`Tree update for ${changes.length} changes, ${removed.length + updated.length + added.length} operations made`, [] , {
      "Previously contained ids": itemIds,
      "Changes processed": changes,
      "Updated items": updated,
      "Removed items": removed,
      "Added items": added,
      "New item structure": changedItemStructure,
      "Old item structure": items,
      "Expanded Ids": expandedIds,
    });
  }, [rootItems, items, dataInterface]);

  const expand = useCallback(async (id: string) => {
    const { results: childs } = await dataInterface.search({ parents: [id] });
    const childIds = childs.map(child => child.id);
    setItems(items => [...items.filter(item => !childIds.includes(item.id)), ...childs]);
    setExpandedIds(ids => [...ids, id]);
  }, [dataInterface]);

  const collapse = useCallback(async (id: string) => {
    setExpandedIds(ids => ids.filter(id2 => id2 !== id));
  }, []);

  const hiddenItems = items
    .filter(item => item.tags.includes(InternalTag.Trash) || item.tags.includes(InternalTag.Internal))
    .map(item => item.id);

  return {
    expandedIds,
    items: items
      .filter(item => !hiddenItems.includes(item.id))
      .map(item => ({ ...item, childIds: item.childIds.filter(id => !hiddenItems.includes(id)) })),
    expand,
    collapse
  };
}