import * as React from 'react';
import { SearchView } from './searchView/SearchView';
import { DataItemKind } from '../../types';

export const FileItems: React.FC<{}> = props => {
  return (
    <SearchView
      title="Files"
      icon="archive"
      hiddenSearch={{ kind: DataItemKind.MediaItem }}
      defaultSearch={{}}
    />
  );
};
