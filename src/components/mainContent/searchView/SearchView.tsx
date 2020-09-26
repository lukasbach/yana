import * as React from 'react';
import cxs from 'cxs';
import { IconName, InputGroup } from '@blueprintjs/core';
import { AutoSizer, Grid } from 'react-virtualized';
import { SearchQuery } from '../../../types';
import { MainContentHeader } from '../MainContentHeader';
import { useEffect, useRef, useState } from 'react';
import { useDataSearch } from '../../../datasource/useDataSearch';
import { searchViewCellDimensions } from './searchViewCellDimensions';
import { SearchViewCard } from './SearchViewCard';


const styles = {
  container: cxs({
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  }),
  content: cxs({
    flexGrow: 1,
    backgroundColor: 'rgb(240,240,240)',
    boxShadow: '0px 3px 4px -2px rgba(0,0,0,.2) inset',
    overflowY: 'auto',
    ' .ReactVirtualized__Grid__innerScrollContainer': {
      width: '100% !important',
      maxWidth: '100% !important',
    }
  })
}

export const SearchView: React.FC<{
  title: string,
  icon: IconName,
  iconColor?: string,
  hiddenSearch: SearchQuery,
  defaultSearch: SearchQuery,
}> = props => {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({ ...props.hiddenSearch, ...props.defaultSearch });
  const items = useDataSearch(searchQuery);
  const searchInputChangeHandler = useRef<number | undefined>();

  useEffect(() => setSearchQuery(q => ({...q, ...props.hiddenSearch})), [props.hiddenSearch])

  return (
    <div className={styles.container}>
      <MainContentHeader
        title={props.title}
        icon={props.icon}
        iconColor={props.iconColor}
        lowerContent={(
          <InputGroup
            type="search"
            leftIcon="search"
            onChange={(e: any) => {
              if (searchInputChangeHandler.current) {
                clearTimeout(searchInputChangeHandler.current);
              }
              const latestValue = e.target.value;
              searchInputChangeHandler.current = setTimeout(() => {
                setSearchQuery(q => ({ ...q, contains: latestValue.split(' ') })); // TODO
                searchInputChangeHandler.current = undefined;
              }, 500) as any;
            }}
            large
          />
        )}
      />
      <div className={styles.content}>
        <AutoSizer>
          {({width, height}) => {
            if (width <= searchViewCellDimensions.cellWidth) return null;

            const rowCount = Math.ceil(items.length / Math.floor(width / searchViewCellDimensions.cellWidth));
            const columnCount = Math.floor(width / searchViewCellDimensions.cellWidth);
            return (
              <Grid
                cellRenderer={cellProps => {
                  const itemId = cellProps.rowIndex * Math.floor(width / searchViewCellDimensions.cellWidth) + cellProps.columnIndex;
                  if (itemId >= items.length) return null;

                  return (
                    <SearchViewCard
                      cellProps={cellProps}
                      dataItem={items[itemId]}
                      additionalLeftMargin={(width - columnCount * searchViewCellDimensions.cellWidth) / 2}
                    />
                  );
                }}
                columnWidth={searchViewCellDimensions.cellWidth}
                columnCount={columnCount}
                noContentRenderer={() => <>No Content</>}
                overscanColumnCount={2}
                overscanRowCount={4}
                rowHeight={searchViewCellDimensions.cellHeight}
                rowCount={rowCount}
                height={height}
                width={width}
              />
            );
          }}
        </AutoSizer>
      </div>
    </div>
  );
};
