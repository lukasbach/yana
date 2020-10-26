import * as React from 'react';
import { DataItem } from '../../types';
import { useDataItems } from '../../datasource/useDataItems';
import { Button, Classes, ControlGroup, MenuItem, Tag } from '@blueprintjs/core';
import { MultiSelect } from '@blueprintjs/select';
import { useEffect, useState } from 'react';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { undup } from '../../utils';
import cxs from 'cxs';


export const TagList: React.FC<{
  dataItem: DataItem;
  isEditing: boolean;
  onStopEditing: () => void;
}> = props => {
  // const [[dataItem]] = useDataItems([props.dataItem]); // TODO
  const dataItem = props.dataItem;
  const dataInterface = useDataInterface();
  const [query, setQuery] = useState('');
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
            <Tag round minimal intent="primary">
              { tag }
            </Tag>
          </React.Fragment>
        )) }
      </>
    )
  } else {
    return (
      <MultiSelect<string>
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
          setQuery('');
        }}
        query={query}
        onQueryChange={setQuery}
        tagRenderer={tag => tag}
        tagInputProps={{
          onRemove: (tag, idx1) => setTags(tags => tags.filter((tag_, idx2) => idx1 !== idx2)),
          tagProps: {  },
          rightElement: (
            <Button minimal icon={'tick'} onClick={() => {
              dataInterface.changeItem(dataItem.id, { tags }).then(props.onStopEditing);
            }} />
          )
        }}
        itemRenderer={(tag, { handleClick, modifiers, query }) => {
          if (!modifiers.matchesPredicate) {
            return null;
          }
          return (
            <MenuItem
              active={modifiers.active}
              disabled={modifiers.disabled}
              icon={tags.includes(tag) ? 'tick' : undefined}
              key={tag}
              onClick={handleClick}
              text={tag}
            />
          );
        }}
        itemPredicate={(itemQuery, item) => item.toLowerCase().includes(itemQuery.toLowerCase())}
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
    )
  }
};
