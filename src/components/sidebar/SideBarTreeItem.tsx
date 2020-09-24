import * as React from 'react';
import { DataItem, DataItemKind, NoteDataItem } from '../../types';
import { Alert, Button, FormGroup, Icon, InputGroup, Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { useState } from 'react';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { SideBarTreeItemUi } from './SideBarTreeItemUi';
import { useMainContentContext } from '../mainContent/context';

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

  const deleteItem = () => {
    dataInterface.removeItem(item.id);
  };

  const createSubCollection = () => {
    dataInterface.createDataItemUnderParent({
      name: 'New Collection',
      childIds: [],
      kind: DataItemKind.Collection,
      lastChange: new Date().getTime(),
      created: new Date().getTime(),
      tags: []
    }, item.id);
  };

  const createSubNote = () => {
    dataInterface.createDataItemUnderParent({
      name: 'New Note Item',
      childIds: [],
      kind: DataItemKind.NoteItem,
      lastChange: new Date().getTime(),
      created: new Date().getTime(),
      tags: [],
      noteType: 'atlaskit-editor-note'
    } as any, item.id)
  };

  let menu: JSX.Element;

  if (item.kind === DataItemKind.Collection) {
    menu = (
      <Menu>
        <MenuItem text="Open" onClick={() => mainContent.openInCurrentTab(item)} />
        <MenuItem text="Open in new Tab" onClick={() => mainContent.newTab(item)} />
        <MenuItem text="Rename" onClick={() => setIsRenaming(true)} />
        <MenuItem text="Delete" onClick={deleteItem} />
        <MenuDivider />
        <MenuItem text="Create new collection" onClick={createSubCollection} />
        <MenuItem text="Create new note item" onClick={createSubNote} />
      </Menu>
    );
  } else {
    menu = (
      <Menu>
        <MenuItem text="Open" onClick={() => mainContent.openInCurrentTab(item)} />
        <MenuItem text="Open in new Tab" onClick={() => mainContent.newTab(item)} />
        <MenuItem text="Rename" onClick={() => setIsRenaming(true)} />
        <MenuItem text="Delete" onClick={deleteItem} />
      </Menu>
    );
  }

  return (
    <SideBarTreeItemUi
      text={item.name}
      isExpandable={item.kind === DataItemKind.Collection}
      isExpanded={isExpanded}
      onExpand={onExpand}
      onCollapse={onCollapse}
      isRenaming={isRenaming}
      isActive={mainContent.openTab?.dataItem.id === item.id}
      onRename={name => {
        dataInterface.changeItem(item.id, { ...item, name });
        setIsRenaming(false);
      }}
      onClick={() => mainContent.openInCurrentTab(item)}
      onMiddleClick={() => mainContent.newTab(item)}
      menu={menu}
    />
  )

  /*return (
    <>
      <Alert
        isOpen={isEditingName}
        canOutsideClickCancel={true}
        onClose={() => setIsEditingName(false)}
        onConfirm={() => {
          dataInterface.changeItem(item.id, {
            ...item,
            name: newName
          })
        }}
      >
        <FormGroup label="New name">
          <InputGroup onChange={(e: any) => setNewName(e.target.value)} value={newName} />
        </FormGroup>
      </Alert>
      {
        hasChildren && (
          <Button minimal={true} small={true} onClick={() => isExpanded ? onCollapse() : onExpand()}>
            <Icon icon={isExpanded ? 'chevron-down' : 'chevron-right'} />
          </Button>
        )
      }
      { item.name }
      {
        item.kind === DataItemKind.Collection && (
          <>
            <Button minimal={true} small={true} onClick={() => setIsEditingName(true)}>
              <Icon icon={'edit'} />
            </Button>
            <Button minimal={true} small={true} onClick={() => dataInterface.createDataItemUnderParent({
              name: 'New Collection',
              childIds: [],
              kind: DataItemKind.Collection,
              lastChange: new Date().getTime(),
              created: new Date().getTime(),
              tags: []
            }, item.id)}>
              <Icon icon={'folder-new'} />
            </Button>
            <Button minimal={true} small={true} onClick={() => dataInterface.createDataItemUnderParent({
              name: 'New Note Item',
              childIds: [],
              kind: DataItemKind.NoteItem,
              lastChange: new Date().getTime(),
              created: new Date().getTime(),
              tags: []
            }, item.id)}>
              <Icon icon={'new-object'} />
            </Button>
            <Button minimal={true} small={true} onClick={() => dataInterface.removeItem(item.id)}>
              <Icon icon={'trash'} />
            </Button>
          </>
        )
      }
    </>
  );*/
};
