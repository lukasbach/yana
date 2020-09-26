import * as React from 'react';
import { GridCellProps } from 'react-virtualized/dist/es/Grid';
import cxs from 'cxs';
import { searchViewCellDimensions } from './searchViewCellDimensions';
import { DataItem } from '../../../types';
import ago from 's-ago';
import { Icon } from '@blueprintjs/core';
import { isNoteItem } from '../../../utils';
import { DataItemSmallPreviewContainer } from './DataItemSmallPreviewContainer';
import { useMainContentContext } from '../context';

const styles = {
  itemCard: cxs({
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0px 2px 3px 1px #bbb',
    margin: '8px',
    height: `${searchViewCellDimensions.cellHeight - 8 * 2}px`,
    transition: '.2s all ease',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0px 6px 10px 2px #bbb',
    }
  }),
  cardHeader: cxs({
    padding: '8px 16px 6px 16px',
    '> h4': {
      margin: 0,
      fontSize: '14px',
      ' .bp3-icon': {
        marginRight: '12px'
      }
    }
  }),
  cardMiddle: cxs({
    padding: '16px',
    backgroundColor: '#eee',
    flexGrow: 1,
    overflow: 'hidden',
  }),
  cardFooter: cxs({
    padding: '6px 16px 6px 16px',
    textAlign: 'right',
    fontStyle: 'italic',
    color: '#444',
    fontSize: '11px'
  }),
}

export const SearchViewCard: React.FC<{
  cellProps: GridCellProps,
  dataItem: DataItem,
  additionalLeftMargin: number,
}> = ({ cellProps, dataItem, additionalLeftMargin }) => {
  const mainContent = useMainContentContext();

  return (
    <div
      key={cellProps.key}
      style={{
        ...cellProps.style,
        transform: `translateX(${additionalLeftMargin}px)`
      }}
      onClick={() => mainContent.openInCurrentTab(dataItem)}
    >
      <div className={styles.itemCard}>
        <div className={styles.cardHeader}>
          <h4>
            <Icon icon={dataItem.icon || (isNoteItem(dataItem) ? 'document' : 'folder-open') as any} color={dataItem.color} />
            { dataItem.name }
          </h4>
        </div>
        <div className={styles.cardMiddle}>
          { isNoteItem(dataItem) && <DataItemSmallPreviewContainer noteItem={dataItem} /> }
        </div>
        <div className={styles.cardFooter}>
          { ago(new Date(dataItem.lastChange)) }
        </div>
      </div>
    </div>
  );
};
