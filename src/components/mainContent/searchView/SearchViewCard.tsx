import * as React from 'react';
import { GridCellProps } from 'react-virtualized/dist/es/Grid';
import cxs from 'cxs';
import { searchViewCellDimensions } from './searchViewCellDimensions';
import { DataItem } from '../../../types';
import ago from 's-ago';
import { Icon } from '@blueprintjs/core';
import { isCollectionItem, isMediaItem, isNoteItem, useAsyncEffect } from '../../../utils';
import { DataItemSmallPreviewContainer } from './DataItemSmallPreviewContainer';
import { useMainContentContext } from '../context';
import { useContextMenu } from '../../useContextMenu';
import { DataItemContextMenu } from '../../menus/DataItemContextMenu';
import { Bp3MenuRenderer } from '../../menus/Bp3MenuRenderer';
import { useDataInterface } from '../../../datasource/DataInterfaceContext';
import { useEffect, useState } from 'react';
import { SearchViewCardUi } from './SearchViewCardUi';
import { useOverlaySearch } from '../../overlaySearch/OverlaySearchProvider';

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
  preview?: string | object,
}> = ({ cellProps, dataItem, additionalLeftMargin, onClick, preview }) => {
  const mainContent = useMainContentContext();
  const dataInterface = useDataInterface();
  const overlaySearch = useOverlaySearch();
  const contextMenuProps = useContextMenu(
    <DataItemContextMenu
      item={dataItem}
      renderer={Bp3MenuRenderer}
      mainContent={mainContent}
      dataInterface={dataInterface}
      overlaySearch={overlaySearch}
    />
  );

  const thumbnail = typeof preview === 'string' ? preview : undefined;
  const noteItemContent = typeof preview === 'object' ? preview : undefined;

  return (
    <SearchViewCardUi
      key={cellProps.key}
      containerStyle={cellProps.style}
      containerProps={contextMenuProps}
      additionalLeftMargin={additionalLeftMargin}
      onClick={onClick || (() => mainContent.openInCurrentTab(dataItem))}
      interactive={true}
      header={dataItem.name}
      icon={dataItem.icon || (isNoteItem(dataItem) ? 'document' : isCollectionItem(dataItem) ? 'folder-open' : 'media') as any}
      iconColor={dataItem.color}
      thumbnail={thumbnail}
      preview={isNoteItem(dataItem) ? <DataItemSmallPreviewContainer noteItem={dataItem} noteItemContent={noteItemContent} /> : undefined}
      footerText={ago(new Date(dataItem.lastChange))}
    />
  );
};
