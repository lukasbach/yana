import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button, InputGroup, MenuItem } from '@blueprintjs/core';
import { DataItemKind, SearchQuery } from '../../../types';
import { parseSearch } from '../../../datasource/parseSearch';
import { Select } from '@blueprintjs/select';
import { useAvailableTags } from '../../../datasource/useAvailableTags';

const dataItemKinds: Array<{ key: DataItemKind, text: string }> = [
  { key: DataItemKind.NoteItem, text: 'Note' },
  { key: DataItemKind.Collection, text: 'Collection' },
  { key: DataItemKind.MediaItem, text: 'Media' },
];

export const SearchInput: React.FC<{
  initialValue?: string,
  onChangeSearchQuery?: (searchQuery: SearchQuery) => void,
}> = props => {
  const [value, setValue] = useState(props.initialValue || '');
  const searchInputChangeHandler = useRef<number | undefined>();
  const [isActive, setIsActive] = useState(false);
  const tags = useAvailableTags();

  useEffect(() => {
    console.log(value)
    if (searchInputChangeHandler.current) {
      clearTimeout(searchInputChangeHandler.current);
    }
    searchInputChangeHandler.current = setTimeout(() => {
      const query = parseSearch(value);
      // if (!Object.keys(query).length) {
      //   query.all = true;
      // }
      props.onChangeSearchQuery?.(query);
      searchInputChangeHandler.current = undefined;
    }, 500) as any;
  }, [value]);

  return (
    <>
      <InputGroup
        type="search"
        leftIcon="search"
        value={value}
        onClick={() => setIsActive(true)}
        onChange={(e: any) => {
          setValue(e.target.value);
          // if (searchInputChangeHandler.current) {
          //   clearTimeout(searchInputChangeHandler.current);
          // }
          // const latestValue = e.target.value;
          // searchInputChangeHandler.current = setTimeout(() => {
          //   // setValue(latestValue);
          //   const query = parseSearch(latestValue);
          //   if (!Object.keys(query).length) {
          //     query.all = true;
          //   }
          //   props.onChangeSearchQuery?.(query);
          //   searchInputChangeHandler.current = undefined;
          // }, 500) as any;
        }}
        large
      />
      <div style={{ display: isActive ? 'block' : 'none', marginTop: '8px' }}>
        <Select<{ value: string }>
          items={tags}
          itemRenderer={(tag, props) => <MenuItem text={tag.value} onClick={props.handleClick} />}
          itemPredicate={(query, item, index, exactMatch) =>
            item.value.toLowerCase().includes(query.toLowerCase())}
          noResults={<MenuItem disabled={true} text="No tags available" />}
          onItemSelect={tag => setValue(v => `${v} tag:${tag.value}`)}
        >
          <Button minimal small icon="tag">
            Filter by tag
          </Button>
        </Select>
        <Select<{ key: DataItemKind, text: string }>
          items={dataItemKinds}
          itemRenderer={(kind, props) => <MenuItem text={kind.text} onClick={props.handleClick} />}
          filterable={false}
          onItemSelect={kind => setValue(v => {
            for (const k of dataItemKinds) {
              v = v.replace(`kind:${k.key}`, '');
            }
            v = v.endsWith(' ') ? v.slice(0, -1) : v;
            return `${v} kind:${kind.key}`;
          })}
        >
          <Button minimal small icon="database">
            Filter by data kind
          </Button>
        </Select>
      </div>
    </>
  );
};
