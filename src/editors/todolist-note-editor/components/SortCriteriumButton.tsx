import * as React from 'react';
import { SortCriterium } from '../sortCriteria';
import { Button } from '@blueprintjs/core';

export const SortCriteriumButton: React.FC<{
  sortCriterium: SortCriterium,
  changeSorting: (criterium: SortCriterium, asc: boolean) => void,
  currentSortCriterium?: SortCriterium,
  asc?: boolean,
}> = props => {

  return (
    <Button
      minimal small
      active={props.sortCriterium.id === props.currentSortCriterium?.id}
      icon={props.sortCriterium.id === props.currentSortCriterium?.id ? (props.asc ? 'sort-asc' : 'sort-desc') : undefined}
      onClick={() => {
        if (props.sortCriterium.id === props.currentSortCriterium?.id) {
          props.changeSorting(props.sortCriterium, !props.asc);
        } else {
          props.changeSorting(props.sortCriterium, true);
        }
      }}
    >
      { props.sortCriterium.name }
    </Button>
  );
};
