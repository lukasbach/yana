import * as React from 'react';
import { GridCellProps } from 'react-virtualized/dist/es/Grid';
import cxs from 'cxs';
import { searchViewCellDimensions } from './searchViewCellDimensions';
import { DataItem } from '../../../types';
import ago from 's-ago';
import { Icon } from '@blueprintjs/core';
import { isMediaItem, isNoteItem, useAsyncEffect } from '../../../utils';
import { DataItemSmallPreviewContainer } from './DataItemSmallPreviewContainer';
import { useMainContentContext } from '../context';
import { useContextMenu } from '../../useContextMenu';
import { DataItemContextMenu } from '../../menus/DataItemContextMenu';
import { Bp3MenuRenderer } from '../../menus/Bp3MenuRenderer';
import { useDataInterface } from '../../../datasource/DataInterfaceContext';
import { useEffect, useState } from 'react';

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
    backgroundPosition: 'center',
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
  onClick?: () => void,
}> = ({ cellProps, dataItem, additionalLeftMargin, onClick }) => {
  const mainContent = useMainContentContext();
  const dataInterface = useDataInterface();
  const contextMenuProps = useContextMenu(<DataItemContextMenu item={dataItem} renderer={Bp3MenuRenderer} mainContent={mainContent} dataInterface={dataInterface} />);
  const [thumbnail, setThumbnail] = useState<string | undefined>();

  console.log(thumbnail)


  useAsyncEffect(async () => {
    console.log(dataItem, isMediaItem(dataItem))
    if (isMediaItem(dataItem) && dataItem.hasThumbnail) {
      setThumbnail(await dataInterface.loadMediaItemContentThumbnailAsPath(dataItem.id));
      console.log(await dataInterface.loadMediaItemContentThumbnailAsPath(dataItem.id), thumbnail)
    } else {
      setThumbnail(undefined);
    }
  }, [dataItem.id]);

  return (
    <div
      key={cellProps.key}
      style={{
        ...cellProps.style,
        transform: `translateX(${additionalLeftMargin}px)`
      }}
      onClick={onClick || (() => mainContent.openInCurrentTab(dataItem))}
      {...contextMenuProps}
    >
      <div className={styles.itemCard}>
        <div className={styles.cardHeader}>
          <h4>
            <Icon icon={dataItem.icon || (isNoteItem(dataItem) ? 'document' : 'folder-open') as any} color={dataItem.color} />
            { dataItem.name }
          </h4>
        </div>
        <div className={styles.cardMiddle} style={{ backgroundImage: thumbnail && `url("file:///${thumbnail.replace(/\\/g, '/')}")` }}>
          { isNoteItem(dataItem) && <DataItemSmallPreviewContainer noteItem={dataItem} /> }
        </div>
        <div className={styles.cardFooter}>
          { ago(new Date(dataItem.lastChange)) }
        </div>
      </div>
    </div>
  );
};
