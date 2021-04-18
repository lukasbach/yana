import * as React from 'react';
import { SearchView } from '../mainContent/searchView/SearchView';
import { useScreenView } from '../telemetry/useScreenView';

export const AllItems: React.FC<{}> = props => {
  useScreenView('all-items');
  return <SearchView title="All Items" icon="layout-grid" hiddenSearch={{ all: true }} defaultSearch={{}} />;
};
