import * as React from 'react';
import { useEffect, useState } from 'react';
import Tree from '@atlaskit/tree';
import cxs from 'cxs';
import { DataItem, DataItemKind } from '../../types';
import { TreeData } from '@atlaskit/tree/types';
import { SideBarTreeItem } from './SideBarTreeItem';
import { useDataTree } from '../../datasource/useDataTree';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { SideBarTreeHeader } from './SideBarTreeHeader';
import { LogService } from '../../common/LogService';

const logger = LogService.getLogger('SideBarTree');

const styles = {
  expandButton: cxs({
    backgroundColor: 'transparent',
    border: 'none'
  })
}

export const SideBarTree: React.FC<{
  title: string;
  rootItems: DataItem[];
  masterItem?: DataItem;
}> = props => {
  const dataInterface = useDataInterface();
  const [renamingItemId, setRenamingItemId] = useState<undefined | string>();
  const [isExpanded, setIsExpanded] = useState(true);
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
    setTreeData(newTree);
  }, [items, expandedIds]);

  return (
    <div>
      <SideBarTreeHeader
        title={props.title}
        isExpanded={isExpanded}
        onChangeIsExpanded={setIsExpanded}
        masterItem={props.masterItem}
        onCreatedItem={item => setRenamingItemId(item.id)}
      />
      {
        isExpanded && (
          <Tree
            offsetPerLevel={16}
            isDragEnabled={true}
            tree={treeData}
            onExpand={(itemId) => expand(itemId as string)}
            onCollapse={(itemId) => collapse(itemId as string)}
            onDragEnd={(source, destination) => {
              if (destination && destination.index !== undefined) {
                const itemId = treeData.items[source.parentId].children[source.index] as string;
                let originalParentId = source.parentId as string;
                let targetParentId = destination.parentId as string;

                if (originalParentId === 'root') {
                  originalParentId = props.masterItem?.id || 'root';
                }
                if (targetParentId === 'root') {
                  targetParentId = props.masterItem?.id || 'root';
                }

                const targetIndex = destination.index;
                logger.log('onDragEnd', [], {source, destination, itemId, originalParentId, targetParentId, targetIndex})
                dataInterface.moveItem(itemId, originalParentId, targetParentId, targetIndex)
              } else {
                logger.log('Skipping onDragEnd, because destination or destination.index is undefined', [], {source, destination})
              }
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
                title={item.id}
              >
                <SideBarTreeItem
                  item={item.data}
                  hasChildren={!!item.hasChildren}
                  isExpanded={!!item.isExpanded}
                  onExpand={() => onExpand(item.id)}
                  onCollapse={() => onCollapse(item.id)}
                  isRenaming={item.id === renamingItemId}
                  onStartRenameItem={setRenamingItemId}
                />
              </div>
            )}
          />
        )
      }
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