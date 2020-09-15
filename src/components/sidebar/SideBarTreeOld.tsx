import * as React from 'react';
import { useEffect, useState } from 'react';
import Tree from '@atlaskit/tree';
import cxs from 'cxs';
import { Button, Icon } from '@blueprintjs/core';
import { useDataInterface, useRefreshedItems } from '../../datasource/DataInterface';
import { DataItem, DataItemKind } from '../../types';
import { TreeData } from '@atlaskit/tree/types';
import { useAsyncEffect } from '../../utils';
import { SideBarTreeItem } from './SideBarTreeItem';

const styles = {
  expandButton: cxs({
    backgroundColor: 'transparent',
    border: 'none'
  })
}

export const SideBarTree: React.FC<{
  rootItems: DataItem[];
}> = props => {
  const dataInterface = useDataInterface();
  useEffect(() => console.log("Root items changed: ", props.rootItems), [props.rootItems]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [loadedContentIds, setLoadedContentIds] = useState<string[]>([]);
  const [items, setItems] = useRefreshedItems(
    props.rootItems,
    changedItemIds => {
      (async () => {
        console.log("Changed: ", changedItemIds)
        for (const id of changedItemIds) {
          const item = await dataInterface.getDataItem(id);
          const isChildOfExpandedItem = expandedIds.map(id => item.parentIds.includes(id)).reduce((a, b) => a || b, false);
          if (isChildOfExpandedItem) {
            console.log("Yep reload, for item", item)
            setLoadedContentIds(ids => ids.filter(i => !item.parentIds.includes(i)));
            setExpandedIds(e => e);
          }
        }
      })();
    }
  );
  console.log("Current items: ", items)
  const [treeData, setTreeData] = useState<TreeData>({
    rootId: 'root',
    items: {
      root: { id: 'root', hasChildren: false, data: {}, children: items.map(item => item.id) },
      ...Object.fromEntries(items.map(item => [
        item.id,
        { id: item.id, hasChildren: item.kind === DataItemKind.Collection, data: item, children: [] }
      ]))
    }
  });

  useAsyncEffect(async () => {
    const loadContentForItems = expandedIds.filter(id => !loadedContentIds.includes(id));
    console.log("Loading childs of newly expanded items...", expandedIds, loadedContentIds, loadContentForItems)
    const loadedContentItems = (await Promise.all(loadContentForItems.map(itemId => dataInterface.searchImmediate({ parents: [itemId] }))))
      .reduce((a, b) => [...a, ...b], []);
    console.log(`Load childs of expanded items. ${loadContentForItems.length} new expansions, ${loadedContentItems.length} new items. Newly expanded are ${loadedContentItems.map(i => i.id).join(', ')}`);
    console.log(props.rootItems, items);
    setItems(oldItems => [...new Set([...oldItems, ...loadedContentItems])]);
    // setLoadedContentIds(old => [...old, ...loadedContentItems.map(item => item.id)]);
    setLoadedContentIds(old => [...old, ...loadContentForItems]);
    console.log(items);

    // const loadedItems = await Promise.all(loadItems.map(id => dataInterface.getDataItem(id)));
    // const loadItems = expandedIds.filter(id => !loadedContentIds.includes(id));

    // let loadedItems = await dataInterface.searchImmediate({ parents: [] });
    // loadedItems = loadedItems.filter(item => items.find(i => i.id !== item.id));
    // console.log("!!", items, loadedItems)
    // setItems(oldItems => [...oldItems, ...loadedItems]);

    // setLoadedContentIds(ids => [...ids, ...loadItems]);
  }, [expandedIds]);

  useEffect(() => {
    const newTree: TreeData = {
      rootId: 'root',
      items: {
        root: { id: 'root', hasChildren: true, data: {}, children: props.rootItems.map(item => item.id) },
        ...Object.fromEntries(items.map(item => [
          item.id,
          {
            id: item.id,
            hasChildren: item.kind === DataItemKind.Collection,
            data: item,
            children: !loadedContentIds.includes(item.id) ? [] : items
              .filter(potentialChild => potentialChild.parentIds.includes(item.id)/* && loadedContentIds.includes(potentialChild.id)*/)
              .map(potentialChild => potentialChild.id),
            isExpanded: expandedIds.includes(item.id)
          }
        ]))
      }
    };
    console.log(`Rebuild tree.`, newTree);
    console.log(`Items are`, items);
    setTreeData(newTree);
    console.log(treeData);
  }, [items, expandedIds]);

  /*
  {
          items: {
            root: { id: 'root', hasChildren: true, data: { name: 'root' }, children: ['coll1', 'coll2'] },
            coll1: { id: 'coll1', hasChildren: true, data: { name: 'Collection 1' }, children: ['coll3', 'note1', 'note2'] },
            coll2: { id: 'coll2', hasChildren: true, data: { name: 'Collection 2' }, children: ['note3', 'note4'] },
            coll3: { id: 'coll3', hasChildren: true, data: { name: 'Collection 3' }, children: ['note5'] },
            note1: { id: 'note1', hasChildren: false, data: { name: 'Note 1' }, children: [''] },
            note2: { id: 'note2', hasChildren: false, data: { name: 'Note 2' }, children: [''] },
            note3: { id: 'note3', hasChildren: false, data: { name: 'Note 3' }, children: [''] },
            note4: { id: 'note4', hasChildren: false, data: { name: 'Note 4' }, children: [''] },
            note5: { id: 'note5', hasChildren: false, data: { name: 'Note 5' }, children: [''] },
          },
          rootId: 'root'
        }
   */

  return (
    <div>
      <Tree
        offsetPerLevel={16}
        isDragEnabled={false}
        tree={treeData}
        onExpand={(itemId) => {
          setExpandedIds(ids => [...ids, itemId as string]);
        }}
        onCollapse={(itemId) => {
          setExpandedIds(ids => ids.filter(id => id !== itemId))
        }}
        renderItem={({ item, onExpand, onCollapse, provided, depth }) => (
          <div
            className={[
              cxs({
              })
            ].join(' ')}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <SideBarTreeItem
              item={item.data}
              hasChildren={!!item.hasChildren}
              isExpanded={!!item.isExpanded}
              onExpand={() => onExpand(item.id)}
              onCollapse={() => onCollapse(item.id)}
            />
          </div>
        )}
      />
    </div>
  );
};

//             {
//               item.hasChildren && (
//                 <Button minimal={true} small={true} onClick={() => item.isExpanded ? onCollapse(item.id) : onExpand(item.id)}>
//                   <Icon icon={item.isExpanded ? 'chevron-down' : 'chevron-right'} />
//                 </Button>
//               )
//             }
//             { item.data.name }
//             {
//               item.data.kind === DataItemKind.Collection && (
//                 <>
//                   <Button minimal={true} small={true} onClick={() => dataInterface.changeItem(item.data.id, {
//                     ...item.data,
//                     name: window.prompt('New name', item.data.name)!
//                   })}>
//                     <Icon icon={'edit'} />
//                   </Button>
//                   <Button minimal={true} small={true} onClick={() => dataInterface.createDataItem({
//                     name: 'New Collection',
//                     parentIds: [item.data.id],
//                     kind: DataItemKind.Collection,
//                     lastChange: new Date().getTime(),
//                     created: new Date().getTime(),
//                     tags: []
//                   })}>
//                     <Icon icon={'folder-new'} />
//                   </Button>
//                   <Button minimal={true} small={true} onClick={() => dataInterface.createDataItem({
//                     name: 'New Note Item',
//                     parentIds: [item.data.id],
//                     kind: DataItemKind.NoteItem,
//                     lastChange: new Date().getTime(),
//                     created: new Date().getTime(),
//                     tags: []
//                   })}>
//                     <Icon icon={'new-object'} />
//                   </Button>
//                 </>
//               )
//             }