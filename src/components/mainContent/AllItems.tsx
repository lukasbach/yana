import * as React from 'react';
import { SearchView } from './searchView/SearchView';

export const AllItems: React.FC<{}> = props => {
  return (
    <SearchView
      title="All Items"
      icon="layout-grid"
      hiddenSearch={{ all: true }}
      defaultSearch={{}}
    />
  );
};
