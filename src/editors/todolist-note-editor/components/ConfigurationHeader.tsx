import * as React from 'react';
import { useSettings } from '../../../appdata/AppDataProvider';
import { Button, Tag } from '@blueprintjs/core';
import cxs from 'cxs';
import {
  CompletedStatusSortCriterium,
  SortCriterium,
  StarStatusSortCriterium,
  TaskColorNameSortCriterium,
  TaskNameSortCriterium,
} from '../sortCriteria';
import { SortCriteriumButton } from './SortCriteriumButton';

const styles = {
  container: cxs({
    display: 'flex',
    margin: '24px 0',
  }),
  left: cxs({
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    marginRight: '24px',
  }),
};

export const ConfigurationHeader: React.FC<{
  changeSorting: (criterium: SortCriterium, asc: boolean) => void;
  sortCriterium?: SortCriterium;
  asc?: boolean;
  hideCompletedItems?: boolean;
  toggleHideCompletedItems: () => void;
  totalItems: number;
  completedItems: number;
}> = props => {
  const settings = useSettings();

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <Button
          minimal
          small
          active={props.hideCompletedItems}
          onClick={props.toggleHideCompletedItems}
          icon={props.hideCompletedItems ? 'eye-off' : 'eye-open'}
        >
          Hide completed items
        </Button>
        <Tag round intent="success" icon="tick" minimal>
          {props.completedItems}/{props.totalItems} completed
        </Tag>
      </div>
      <div>
        Sort for{' '}
        <SortCriteriumButton
          sortCriterium={TaskNameSortCriterium}
          currentSortCriterium={props.sortCriterium}
          changeSorting={props.changeSorting}
          asc={props.asc}
        />
        <SortCriteriumButton
          sortCriterium={TaskColorNameSortCriterium}
          currentSortCriterium={props.sortCriterium}
          changeSorting={props.changeSorting}
          asc={props.asc}
        />
        <SortCriteriumButton
          sortCriterium={CompletedStatusSortCriterium}
          currentSortCriterium={props.sortCriterium}
          changeSorting={props.changeSorting}
          asc={props.asc}
        />
        <SortCriteriumButton
          sortCriterium={StarStatusSortCriterium}
          currentSortCriterium={props.sortCriterium}
          changeSorting={props.changeSorting}
          asc={props.asc}
        />
      </div>
    </div>
  );
};
