import * as React from 'react';
import { SearchView } from '../mainContent/searchView/SearchView';
import { InternalTag } from '../../datasource/InternalTag';
import { useScreenView } from '../telemetry/useScreenView';

export const DraftItems: React.FC<{}> = props => {
  useScreenView('draft-items');
  return (
    <SearchView
      title="Draft Items"
      icon="edit"
      hiddenSearch={{ tags: [InternalTag.Draft], notTags: [InternalTag.Trash] }}
      defaultSearch={{}}
    />
  );
};
