import * as React from 'react';
import { DataItem } from '../../types';
import { useDataItems } from '../../datasource/useDataItems';
import { Button, ControlGroup, MenuItem, Tag } from '@blueprintjs/core';
import { MultiSelect } from '@blueprintjs/select';
import { useEffect, useState } from 'react';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { undup } from '../../utils';

const TagMultiSelect = MultiSelect.ofType<string>();

export const TagList: React.FC<{
  dataItem: DataItem;
  isEditing: boolean;
  onStopEditing: () => void;
}> = props => {
  // const [[dataItem]] = useDataItems([props.dataItem]); // TODO
  const dataItem = props.dataItem;
  const dataInterface = useDataInterface();
  const [tags, setTags] = useState(dataItem.tags);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  useEffect(() => setTags(dataItem.tags), [dataItem.tags]);
  useEffect(() => {
    dataInterface.getAvailableTags().then(tags => setAvailableTags(tags.map(tag => tag.value)));
  }, [dataItem.id]);

  if (!props.isEditing) {
    return (
      <>
        { dataItem.tags.filter(tag => !tag.startsWith('__')).map(tag => (
          <React.Fragment key={tag}>
            {' '}
            <Tag round={true}>
              { tag }
            </Tag>
          </React.Fragment>
        )) }
      </>
    )
  } else {
    return (
      <div style={{ maxWidth: '300px' }}>
        <TagMultiSelect
          fill={true}
          popoverProps={{ minimal: true }}
          items={undup([...availableTags, ...tags].filter(tag => !tag.startsWith('__')))}
          selectedItems={tags.filter(tag => !tag.startsWith('__'))}
          onItemSelect={tag => {
            if (tags.includes(tag)) {
              setTags(tags => tags.filter(tag_ => tag_ !== tag));
            } else {
              setTags(tags => [...tags, tag]);
            }
          }}
          tagRenderer={tag => tag}
          tagInputProps={{
            onRemove: (tag, idx1) => setTags(tags => tags.filter((tag_, idx2) => idx1 !== idx2)),
            tagProps: {  }
          }}
          itemRenderer={(tag, { handleClick, modifiers, query }) => {
            if (!modifiers.matchesPredicate) {
              return null;
            }
            return (
              <MenuItem
                active={modifiers.active}
                disabled={modifiers.disabled}
                key={tag}
                onClick={handleClick}
                text={tag}
              />
            );
          }}
          createNewItemFromQuery={value => value}
          // itemsEqual={(tag1, tag2) => tag1 === tag2}
          createNewItemRenderer={(query, active, handleClick) => (
            <MenuItem
              icon="add"
              text={`Create tag "${query}"`}
              active={active}
              onClick={handleClick}
              shouldDismissPopover={false}
            />
          )}
        />
        <Button icon={'tick'} onClick={() => {
          dataInterface.changeItem(dataItem.id, {...dataItem, tags}).then(props.onStopEditing);
        }} />
      </div>
    )
  }
};
