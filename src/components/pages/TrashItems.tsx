import * as React from 'react';
import { SearchView } from '../mainContent/searchView/SearchView';
import { InternalTag } from '../../datasource/InternalTag';
import { useScreenView } from '../telemetry/useScreenView';

export const TrashItems: React.FC<{}> = props => {
  useScreenView('trash-items');
  return (
    <SearchView
      title="Trash"
      icon="trash"
      hiddenSearch={{ tags: [InternalTag.Trash] }}
      defaultSearch={{}}
    />
  );
};
