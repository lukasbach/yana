import * as React from 'react';
import { Button, H5 } from '@blueprintjs/core';
import { SearchQuery, SearchQuerySortColumn, SearchQuerySortDirection } from '../../types';

export const SortingOptions: React.FC<{
  searchQuery: SearchQuery,
  onChange: (changed: SearchQuery) => void,
}> = props => {

  return (
    <div>
      <br />
      <H5>Sorting for column</H5>
      <Button
        text="Name"
        icon={'sort-alphabetical'}
        onClick={() => props.onChange({
          ...props.searchQuery,
          sortColumn: SearchQuerySortColumn.Name
        })}
        active={props.searchQuery.sortColumn === SearchQuerySortColumn.Name || !props.searchQuery.sortColumn}
        minimal
      />
      <br />
      <Button
        text="Last Change"
        icon={'sort-numerical'}
        onClick={() => props.onChange({
          ...props.searchQuery,
          sortColumn: SearchQuerySortColumn.LastChange
        })}
        active={props.searchQuery.sortColumn === SearchQuerySortColumn.LastChange}
        minimal
      />
      <br />
      <Button
        text="Creation Date"
        icon={'sort-numerical'}
        onClick={() => props.onChange({
          ...props.searchQuery,
          sortColumn: SearchQuerySortColumn.Created
        })}
        active={props.searchQuery.sortColumn === SearchQuerySortColumn.Created}
        minimal
      />
      <br />
      <br />
      <H5>Sorting direction</H5>
      <Button
        text="Ascending"
        icon={'sort-asc'}
        onClick={() => props.onChange({
          ...props.searchQuery,
          sortDirection: SearchQuerySortDirection.Ascending
        })}
        active={props.searchQuery.sortDirection === SearchQuerySortDirection.Ascending || !props.searchQuery.sortDirection}
        minimal
      />
      <br />
      <Button
        text="Descending"
        icon={'sort-desc'}
        onClick={() => props.onChange({
          ...props.searchQuery,
          sortDirection: SearchQuerySortDirection.Descending
        })}
        active={props.searchQuery.sortDirection === SearchQuerySortDirection.Descending}
        minimal
      />
    </div>
  );
};
