import * as React from 'react';
import { Button, Drawer, FormGroup, HTMLSelect, InputGroup, MenuItem } from '@blueprintjs/core';
import { DrawerUi } from '../drawerUi';
import { Select } from '@blueprintjs/select';
import { IconName } from '@blueprintjs/icons';
import { useDataItem } from '../../../datasource/useDataItem';
import { useDataInterface } from '../../../datasource/DataInterfaceContext';
import { IconNames } from '../../../common/IconNames';
import { TagList } from '../../common/TagList';
import { useState } from 'react';

export const EditItemDrawer: React.FC<{ isOpen: boolean, onSetIsOpen: (open: boolean) => void, itemId: string }> = props => {
  const dataInterface = useDataInterface();
  const item = useDataItem(props.itemId);
  const [isEditingTags, setIsEditingTags] = useState(false);

  if (!item) {
    return null;
  }

  return (
    <Drawer
      isOpen={props.isOpen}
      portalClassName="drawer-portal-container"
      onClose={() => props.onSetIsOpen(false)}
      size={Drawer.SIZE_SMALL}
      title="Editing Item"
    >
      <DrawerUi.Container>
        <DrawerUi.Card title="Note Metadata">
          <FormGroup label="Icon">
            <Select<IconName>
              // popoverProps={{ minimal: true }}
              items={IconNames}
              itemsEqual={(a, b) => a === b}
              itemPredicate={(query, item) => item.includes(query)}
              activeItem={item.icon as any}
              itemRenderer={(item, { modifiers, query, handleClick }) => {
                if (!modifiers.matchesPredicate) {
                  return null;
                }
                return (
                  <MenuItem
                    active={modifiers.active}
                    disabled={modifiers.disabled}
                    key={item}
                    onClick={handleClick}
                    text={item}
                    icon={item}
                  />
                );
              }}
              onItemSelect={icon => dataInterface.changeItem(item!.id, { icon })}
            >
              <Button text={item.icon || 'No icon'} rightIcon="caret-down" minimal fill />
            </Select>
          </FormGroup>

          <FormGroup label="Icon Color">
            <InputGroup
              type="color"
              value={item.color}
              onChange={(event: any) => dataInterface.changeItem(item!.id, { color: event.target.value })}
            />
          </FormGroup>
        </DrawerUi.Card>
        <DrawerUi.Card title="Tags">
          <TagList dataItem={item} isEditing={isEditingTags} onStopEditing={() => setIsEditingTags(false)} />
        </DrawerUi.Card>
      </DrawerUi.Container>
    </Drawer>
  );
};
