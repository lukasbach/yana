import * as React from 'react';
import { useEffect, useState } from 'react';
import Tree from '@atlaskit/tree';
import cxs from 'cxs';
import { DataItem, DataItemKind } from '../../types';
import { TreeData } from '@atlaskit/tree/types';
import { SideBarTreeItem } from './SideBarTreeItem';
import { useDataTree } from '../../datasource/useDataTree';
import { useDataInterface } from '../../datasource/DataInterfaceContext';

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
  const { items, collapse, expand, expandedIds } = useDataTree(props.rootItems);

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

  useEffect(() => {
    const itemIds = items.map(item => item.id);
    const newTree: TreeData = {
      rootId: 'root',
      items: {
        root: { id: 'root', hasChildren: true, data: {}, children: !items.length? [] : props.rootItems.filter(item => itemIds.includes(item.id)).map(item => item.id) },
        ...Object.fromEntries(items.map(item => [
          item.id,
          {
            id: item.id,
            hasChildren: item.kind === DataItemKind.Collection,
            data: item,
            children: item.childIds.filter(child => itemIds.includes(child)),
            isExpanded: expandedIds.includes(item.id)
          }
        ]))
      }
    };
    console.log(`Rebuild tree.`, newTree, items);
    setTreeData(newTree);
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
        isDragEnabled={true}
        tree={treeData}
        onExpand={(itemId) => expand(itemId as string)}
        onCollapse={(itemId) => collapse(itemId as string)}
        renderItem={({ item, onExpand, onCollapse, provided, depth }) => (
          <div
            className={[
              cxs({
              })
            ].join(' ')}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            title={item.id}
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