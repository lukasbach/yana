import * as React from 'react';
import { Select } from '@blueprintjs/select';
import { Button, MenuItem } from '@blueprintjs/core';
import { DataItemKind } from '../../types';
import { useAvailableTags } from '../../datasource/useAvailableTags';
import { useSearchBar } from './SearchBar';

const dataItemKinds: Array<{ key: DataItemKind, text: string }> = [
  { key: DataItemKind.NoteItem, text: 'Note' },
  { key: DataItemKind.Collection, text: 'Collection' },
  { key: DataItemKind.MediaItem, text: 'Media' },
];

export const SearchBarModifiers: React.FC<{
  buttonProps?: { minimal?: boolean, small?: boolean, big?: boolean, outlined?: boolean  },
}> = props => {
  const { searchQuery, setSearchValue, searchValue } = useSearchBar();
  const tags = useAvailableTags();

  return (
    <>
      <Select<{ value: string }>
        items={tags}
        itemRenderer={(tag, props) => <MenuItem text={tag.value} onClick={props.handleClick} />}
        itemPredicate={(query, item, index, exactMatch) =>
          item.value.toLowerCase().includes(query.toLowerCase())}
        noResults={<MenuItem disabled={true} text="No tags available" />}
        onItemSelect={tag => setSearchValue(`${searchValue} tag:${tag.value}`)}
      >
        <Button icon="tag" {...(props.buttonProps || {})}>
          Filter by tag
        </Button>
      </Select>
      <Select<{ key: DataItemKind, text: string }>
        items={dataItemKinds}
        itemRenderer={(kind, props) => <MenuItem text={kind.text} onClick={props.handleClick} />}
        filterable={false}
        onItemSelect={kind => {
          let v = searchValue;
          for (const k of dataItemKinds) {
            v = v.replace(`kind:${k.key}`, '');
          }
          v = v.endsWith(' ') ? v.slice(0, -1) : v;
          setSearchValue(`${v} kind:${kind.key}`);
        }}
      >
        <Button icon="database" {...(props.buttonProps || {})}>
          Filter by data kind
        </Button>
      </Select>
      <Button
        icon="search-text"
        {...(props.buttonProps || {})}
        active={searchQuery.containsInContents}
        onClick={() => {
          if (searchQuery.containsInContents) {
            setSearchValue(searchValue.replace(/(\s*intext\:[^\s]*\s*)/g, ''));
          } else {
            setSearchValue(`${searchValue} intext:true`);
          }
        }}
      >
        Search through note contents
      </Button>
    </>
  );
};
