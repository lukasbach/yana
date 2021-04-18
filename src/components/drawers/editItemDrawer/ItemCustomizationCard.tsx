import * as React from 'react';
import { Button, Checkbox, FormGroup, MenuItem } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { IconName } from '@blueprintjs/icons';
import { IconNames } from '../../../common/IconNames';
import { ColorPickerInput } from '../../common/ColorPickerInput';
import { DrawerUi } from '../drawerUi';
import { useEffect, useState } from 'react';
import { useDataInterface } from '../../../datasource/DataInterfaceContext';
import { useDataItem } from '../../../datasource/useDataItem';
import { DataItem } from '../../../types';

export const ItemCustomizationCard: React.FC<{ item: DataItem }> = props => {
  const item = props.item;
  const dataInterface = useDataInterface();
  const [color, setColor] = useState(item.color);
  const [icon, setIcon] = useState(item.icon);
  const [dirty, setDirty] = useState(false);

  useEffect(() => setColor(item.color), [item.color]);
  useEffect(() => setIcon(item.icon), [item.icon]);

  const save = async () => {
    if (dirty && item) {
      await dataInterface.changeItem(item.id, { color, icon });
      setDirty(false);
    }
  };

  return (
    <>
      <FormGroup
        label={
          <Checkbox
            checked={!!icon}
            onChange={(e: any) => {
              setIcon(e.target.checked ? 'document' : undefined);
              setDirty(true);
            }}
            label={'Custom Icon'}
          />
        }
      >
        <Select<IconName>
          popoverProps={{ minimal: true }}
          disabled={!icon}
          items={IconNames}
          itemsEqual={(a, b) => a === b}
          itemPredicate={(query, item) => item.includes(query)}
          activeItem={icon as any}
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
          onItemSelect={icon => {
            setIcon(icon);
            setDirty(true);
          }}
        >
          <Button text={icon || 'No icon'} rightIcon="caret-down" icon={icon as any} disabled={!icon} minimal fill />
        </Select>
      </FormGroup>

      <FormGroup
        label={
          <Checkbox
            checked={!!color}
            onChange={(e: any) => {
              setColor(e.target.checked ? '#000000' : undefined);
              setDirty(true);
            }}
            label={'Custom Icon Color'}
          />
        }
      >
        <ColorPickerInput
          color={color || '#000000'}
          onChange={color => {
            setColor(color);
            setDirty(true);
          }}
          inputProps={{ disabled: !color }}
        />
      </FormGroup>

      {dirty && (
        <Button onClick={save} intent={'primary'} outlined>
          Save
        </Button>
      )}
    </>
  );
};
