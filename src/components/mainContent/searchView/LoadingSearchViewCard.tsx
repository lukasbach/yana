import * as React from 'react';
import { SearchViewCardUi, SearchViewCardUiProps } from './SearchViewCardUi';
import { NonIdealState, Spinner } from '@blueprintjs/core';

export const LoadingSearchViewCard: React.FC<Omit<SearchViewCardUiProps, 'header' | 'thumbnail' | 'preview' | 'icon' | 'iconColor' | 'interactive'>> = props => {
  return (
    <SearchViewCardUi
      header="Loading"
      preview={(
        <NonIdealState
          icon={<Spinner />}
        />
      )}
      interactive={false}
      {...props}
    />
  );
};
