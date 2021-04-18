import * as React from 'react';
import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { SearchQuery, SearchQuerySortColumn, SearchQuerySortDirection } from '../../../types';

export const SearchSortingMenu: React.FC<{
  searchQuery: SearchQuery;
  onChange: (changed: SearchQuery) => void;
}> = props => {
  return (
    <Menu>
      <MenuDivider title="Sorting for column" />
      <MenuItem
        text="Name"
        icon={'sort-alphabetical'}
        onClick={() =>
          props.onChange({
            ...props.searchQuery,
            sortColumn: SearchQuerySortColumn.Name,
          })
        }
        active={props.searchQuery.sortColumn === SearchQuerySortColumn.Name || !props.searchQuery.sortColumn}
      />
      <MenuItem
        text="Last Change"
        icon={'sort-numerical'}
        onClick={() =>
          props.onChange({
            ...props.searchQuery,
            sortColumn: SearchQuerySortColumn.LastChange,
          })
        }
        active={props.searchQuery.sortColumn === SearchQuerySortColumn.LastChange}
      />
      <MenuItem
        text="Creation Date"
        icon={'sort-numerical'}
        onClick={() =>
          props.onChange({
            ...props.searchQuery,
            sortColumn: SearchQuerySortColumn.Created,
          })
        }
        active={props.searchQuery.sortColumn === SearchQuerySortColumn.Created}
      />
      <MenuDivider title="Sorting direction" />
      <MenuItem
        text="Ascending"
        icon={'sort-asc'}
        onClick={() =>
          props.onChange({
            ...props.searchQuery,
            sortDirection: SearchQuerySortDirection.Ascending,
          })
        }
        active={
          props.searchQuery.sortDirection === SearchQuerySortDirection.Ascending || !props.searchQuery.sortDirection
        }
      />
      <MenuItem
        text="Descending"
        icon={'sort-desc'}
        onClick={() =>
          props.onChange({
            ...props.searchQuery,
            sortDirection: SearchQuerySortDirection.Descending,
          })
        }
        active={props.searchQuery.sortDirection === SearchQuerySortDirection.Descending}
      />
    </Menu>
  );
};
