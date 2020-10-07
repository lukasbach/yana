import * as React from 'react';
import { DataItem, DataItemKind, NoteDataItem } from '../../types';
import { Alert, Button, FormGroup, Icon, InputGroup, Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { useState } from 'react';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { SideBarTreeItemUi } from './SideBarTreeItemUi';
import { useMainContentContext } from '../mainContent/context';
import { NoteItemContextMenu } from '../menus/NoteItemContextMenu';
import { Bp3MenuRenderer } from '../menus/Bp3MenuRenderer';
import { isCollectionItem, isNoteItem } from '../../utils';
import { DataItemContextMenu } from '../menus/DataItemContextMenu';

export const SideBarTreeItem: React.FC<{
  item: DataItem,
  hasChildren: boolean,
  isExpanded: boolean,
  onExpand: () => void,
  onCollapse: () => void,
}> = props => {
  const dataInterface = useDataInterface();
  const mainContent = useMainContentContext();
  const { item, hasChildren, isExpanded, onExpand, onCollapse } = props;
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const [isRenaming, setIsRenaming] = useState(false);

  const menu = (
    <DataItemContextMenu
      item={item}
      renderer={Bp3MenuRenderer}
      onStartRename={() => setIsRenaming(true)}
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
      isRenaming={isRenaming}
      isActive={mainContent.openTab?.dataItem?.id === item.id}
      onRename={name => {
        dataInterface.changeItem(item.id, { ...item, name });
        setIsRenaming(false);
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
