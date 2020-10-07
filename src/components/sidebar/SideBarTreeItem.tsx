import * as React from 'react';
import { DataItem, DataItemKind } from '../../types';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { SideBarTreeItemUi } from './SideBarTreeItemUi';
import { useMainContentContext } from '../mainContent/context';
import { Bp3MenuRenderer } from '../menus/Bp3MenuRenderer';
import { DataItemContextMenu } from '../menus/DataItemContextMenu';

export const SideBarTreeItem: React.FC<{
  item: DataItem,
  hasChildren: boolean,
  isExpanded: boolean,
  onExpand: () => void,
  onCollapse: () => void,
  isRenaming: boolean,
  onStartRenameItem: (id?: string) => void,
}> = props => {
  const dataInterface = useDataInterface();
  const mainContent = useMainContentContext();
  const { item, hasChildren, isExpanded, onExpand, onCollapse } = props;

  const menu = (
    <DataItemContextMenu
      item={item}
      renderer={Bp3MenuRenderer}
      onStartRename={() => props.onStartRenameItem(item.id)}
      onCreatedItem={item => props.onStartRenameItem(item.id)}
      dataInterface={dataInterface}
      mainContent={mainContent}
    />
  );

  return (
    <SideBarTreeItemUi
      text={item.name}
      isExpandable={item.kind === DataItemKind.Collection}
      isExpanded={isExpanded}
      onExpand={onExpand}
      onCollapse={onCollapse}
      isRenaming={props.isRenaming}
      isActive={mainContent.openTab?.dataItem?.id === item.id}
      onRename={name => {
        dataInterface.changeItem(item.id, { ...item, name });
        props.onStartRenameItem(undefined);
      }}
      onClick={() => mainContent.openInCurrentTab(item)}
      onMiddleClick={() => mainContent.newTab(item)}
      onTitleClick={() => mainContent.openInCurrentTab(item)}
      menu={menu}
      icon={item.icon || (item.kind === DataItemKind.NoteItem ? 'document' : 'folder-open') as any}
      iconColor={item.color}
    />
  );
};
