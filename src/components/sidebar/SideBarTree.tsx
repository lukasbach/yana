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
import { UntruncateItem } from './UntruncateItem';
import { useSettings } from '../../appdata/AppDataProvider';

const logger = LogService.getLogger('SideBarTree');

const TRUNCATION_ITEM = '__TRUNC_TOKEN';

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
  const {
    sidebarNumberOfUntruncatedItems: untruncatedItemsCount,
    sidebarOffsetPerLevel: offsetPerLevel
  } = useSettings();
  const [renamingItemId, setRenamingItemId] = useState<undefined | string>();
  const [isExpanded, setIsExpanded] = useState(true);
  const { items, collapse, expand, expandedIds } = useDataTree(props.rootItems);
  const [untruncatedItems, setUntruncatedItems] = useState<string[]>([]); // TODO could be moved into its own hook

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

  useEffect(() => { // TODO should be moved into its own hook
    const itemIds = items.map(item => item.id);
    const newTree: TreeData = {
      rootId: 'root',
      items: {
        root: { id: 'root', hasChildren: true, data: {}, children: !items.length? [] : props.rootItems.filter(item => itemIds.includes(item.id)).map(item => item.id) },
      }
    };

    for (const item of items) {
      const shouldTruncate = !untruncatedItems.includes(item.id) && item.childIds.length > untruncatedItemsCount;
      const token = TRUNCATION_ITEM + item.id;
      newTree.items[item.id] = {
        id: item.id,
        hasChildren: item.kind === DataItemKind.Collection,
        data: item,
        children: [
          ...item.childIds
            .filter(child => itemIds.includes(child))
            .filter((child, idx) => idx < untruncatedItemsCount || untruncatedItems.includes(item.id)),
          ...(shouldTruncate ? [token] : [])
        ],
        isExpanded: expandedIds.includes(item.id)
      };

      if (shouldTruncate) {
        newTree.items[token] = {
          id: token,
          hasChildren: false,
          data: { truncatedItem: item },
          children: [],
        };
      }
    }

    setTreeData(newTree);
  }, [
    items.map(item => item.id).join('___'),
    expandedIds.join('___'),
    items.map(item => item.name).join('___'),
    items.map(item => item.childIds.join('___')).join('____'),
    untruncatedItems
  ]); // TODO!!
  // }, [items, expandedIds]); // TODO!!

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
            offsetPerLevel={offsetPerLevel}
            isDragEnabled={true}
            tree={treeData}
            onExpand={(itemId) => expand(itemId as string)}
            onCollapse={(itemId) => {
              collapse(itemId as string);
              setUntruncatedItems(utimes => utimes.filter(item => item !== itemId));
            }}
            onDragEnd={(source, destination) => {
              logger.log(`onDragEnd invoked with`, [], {source, destination})
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
                logger.log('onDragEnd finished', [], {source, destination, itemId, originalParentId, targetParentId, targetIndex})
                dataInterface.moveItem(itemId, originalParentId, targetParentId, targetIndex)
              } else {
                logger.log('Skipping onDragEnd, because destination or destination.index is undefined', [], {source, destination})
              }
            }}
            renderItem={({ item, onExpand, onCollapse, provided, depth }) => {
              if ((item.id as string).startsWith(TRUNCATION_ITEM)) {
                const truncatedItem = (item.id as string).slice(TRUNCATION_ITEM.length);
                return (
                  <UntruncateItem
                    itemCount={(item.data.truncatedItem as DataItem).childIds.length - untruncatedItemsCount}
                    style={provided.draggableProps.style}
                    onClick={() => setUntruncatedItems(uitems => [...uitems, truncatedItem])}
                  >
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    />
                  </UntruncateItem>
                );
              } else {
                return (
                  <div
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
                );
              }
            }}
          />
        )
      }
    </div>
  );
};
