import * as React from 'react';
import { Button, Checkbox, Drawer, FormGroup, HTMLSelect, InputGroup, MenuItem } from '@blueprintjs/core';
import { DrawerUi } from '../drawerUi';
import { Select } from '@blueprintjs/select';
import { IconName } from '@blueprintjs/icons';
import { useDataItem } from '../../../datasource/useDataItem';
import { useDataInterface } from '../../../datasource/DataInterfaceContext';
import { IconNames } from '../../../common/IconNames';
import { TagList } from '../../common/TagList';
import { useEffect, useState } from 'react';
import { ColorPickerInput } from '../../common/ColorPickerInput';
import { ItemCustomizationCard } from './ItemCustomizationCard';
import { DetailedListItem } from '../../common/DetailedListItem';

export const EditItemDrawer: React.FC<{ isOpen: boolean, onSetIsOpen: (open: boolean) => void, itemId: string }> = props => {
  const item = useDataItem(props.itemId);

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
        <DrawerUi.Card title="Item Customization">
          <ItemCustomizationCard item={item} />
        </DrawerUi.Card>

        <DrawerUi.Card title="Tags">
          <TagList dataItem={item} isEditing={false} onStopEditing={() => {}} />
        </DrawerUi.Card>
      </DrawerUi.Container>
    </Drawer>
  );
};
