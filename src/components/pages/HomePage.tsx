import * as React from 'react';
import { SearchView } from '../mainContent/searchView/SearchView';
import { InternalTag } from '../../datasource/InternalTag';
import { DataItemKind, SearchQuerySortColumn, SearchQuerySortDirection } from '../../types';
import { useScreenView } from '../telemetry/useScreenView';

export const HomePage: React.FC<{}> = props => {
  useScreenView('home');
  return (
    <SearchView
      title="Recent Items"
      icon="home"
      hiddenSearch={{
        notTags: [InternalTag.Trash],
        sortColumn: SearchQuerySortColumn.LastChange,
        sortDirection: SearchQuerySortDirection.Descending,
        kind: DataItemKind.NoteItem,
      }}
      defaultSearch={{}}
    />
  );
};
