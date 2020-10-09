import * as React from 'react';
import { SearchView } from '../mainContent/searchView/SearchView';
import { InternalTag } from '../../datasource/InternalTag';

export const TrashItems: React.FC<{}> = props => {
  return (
    <SearchView
      title="Trash"
      icon="trash"
      hiddenSearch={{ tags: [InternalTag.Trash] }}
      defaultSearch={{}}
    />
  );
};
