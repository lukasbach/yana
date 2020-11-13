import * as React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import { Button, InputGroup, MenuItem } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { DataItemKind, SearchQuery } from '../../types';
import { useAvailableTags } from '../../datasource/useAvailableTags';
import { parseSearch } from '../../datasource/parseSearch';


export interface SearchBarContextValue {
  searchValue: string;
  setSearchValue: (value: string) => void;
  searchQuery: SearchQuery;
  // setSearchQuery: (query: SearchQuery) => void;
}

export const SearchBarContext = React.createContext<SearchBarContextValue>(null as any);
export const useSearchBar = () => useContext(SearchBarContext);

export const SearchBar: React.FC<{
  initialValue?: string,
  onChangeSearchQuery?: (searchQuery: SearchQuery) => void,
}> = props => {
  const [value, setValue] = useState(props.initialValue || '');
  const [query, setQuery] = useState(parseSearch(props.initialValue || ''));
  const searchInputChangeHandler = useRef<number | undefined>();

  useEffect(() => {
    if (searchInputChangeHandler.current) {
      clearTimeout(searchInputChangeHandler.current);
    }
    searchInputChangeHandler.current = setTimeout(() => {
      const query = parseSearch(value);
      props.onChangeSearchQuery?.(query);
      setQuery(query);
      searchInputChangeHandler.current = undefined;
    }, 500) as any;
  }, [value]);

  return (
    <SearchBarContext.Provider
      value={{
        searchValue: value,
        searchQuery: query,
        setSearchValue: setValue,
      }}
    >
      { props.children }
    </SearchBarContext.Provider>
  );
};
