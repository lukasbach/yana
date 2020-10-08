import * as React from 'react';
import { SearchView } from '../mainContent/searchView/SearchView';
import { InternalTag } from '../../datasource/InternalTag';

export const StarredItems: React.FC<{}> = props => {
  return (
    <SearchView
      title="Starred Items"
      icon="star"
      hiddenSearch={{ tags: [InternalTag.Starred] }}
      defaultSearch={{}}
    />
  );
};
