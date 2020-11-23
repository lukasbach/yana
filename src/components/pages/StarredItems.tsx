import * as React from 'react';
import { SearchView } from '../mainContent/searchView/SearchView';
import { InternalTag } from '../../datasource/InternalTag';
import { useScreenView } from '../telemetry/useScreenView';

export const StarredItems: React.FC<{}> = props => {
  useScreenView('starred-items');
  return (
    <SearchView
      title="Starred Items"
      icon="star"
      hiddenSearch={{ tags: [InternalTag.Starred], notTags: [InternalTag.Trash] }}
      defaultSearch={{}}
    />
  );
};
