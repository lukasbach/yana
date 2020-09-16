import * as React from 'react';
import { DataItem, DataItemKind } from '../../types';
import { Alert, Button, FormGroup, Icon, InputGroup } from '@blueprintjs/core';
import { useDataInterface } from '../../datasource/DataInterface';
import { useState } from 'react';

export const SideBarTreeItem: React.FC<{
  item: DataItem,
  hasChildren: boolean,
  isExpanded: boolean,
  onExpand: () => void,
  onCollapse: () => void,
}> = props => {
  const dataInterface = useDataInterface();
  const { item, hasChildren, isExpanded, onExpand, onCollapse } = props;
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(item.name);

  return (
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
  );
};
