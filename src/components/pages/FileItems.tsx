import * as React from 'react';
import { SearchView } from '../mainContent/searchView/SearchView';
import { DataItemKind } from '../../types';
import { InternalTag } from '../../datasource/InternalTag';
import { useScreenView } from '../telemetry/useScreenView';

export const FileItems: React.FC<{}> = props => {
  useScreenView('file-items');
  return (
    <SearchView
      title="Files"
      icon="archive"
      hiddenSearch={{ kind: DataItemKind.MediaItem, notTags: [InternalTag.Trash] }}
      defaultSearch={{}}
    />
  );
};
