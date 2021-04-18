import * as React from 'react';
import cxs from 'cxs';
import { PageHeader } from '../common/PageHeader';
import { CollectionDataItem } from '../../types';
import { InputGroup } from '@blueprintjs/core';
import { AutoSizer, Grid } from 'react-virtualized';
import { SearchView } from './searchView/SearchView';

const CELL_WIDTH = 300;
const CELL_HEIGHT = 160;

const styles = {
  container: cxs({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  }),
  content: cxs({
    flexGrow: 1,
    backgroundColor: 'rgb(240,240,240)',
    boxShadow: '0px 3px 4px -2px rgba(0,0,0,.2) inset',
    overflowY: 'auto',
  }),
  itemCard: cxs({
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0px 2px 3px 1px #bbb',
    margin: '8px',
    padding: '16px',
    height: `${CELL_HEIGHT - 8 * 2}px`,
    transition: '.2s all ease',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-8px)',
    },
  }),
};

export const CollectionContainer: React.FC<{
  dataItem: CollectionDataItem;
}> = props => {
  return (
    <SearchView
      title={props.dataItem.name}
      icon={(props.dataItem.icon as any) || 'document'}
      hiddenSearch={{ parents: [props.dataItem.id] }}
      defaultSearch={{}}
    />
  );
};
