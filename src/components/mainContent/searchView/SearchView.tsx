import * as React from 'react';
import { IconName, InputGroup } from '@blueprintjs/core';
import { AutoSizer, Grid } from 'react-virtualized';
import { DataItem, SearchQuery } from '../../../types';
import { PageHeader } from '../../common/PageHeader';
import { useEffect, useRef, useState } from 'react';
import { useDataSearch } from '../../../datasource/useDataSearch';
import { searchViewCellDimensions } from './searchViewCellDimensions';
import { SearchViewCard } from './SearchViewCard';
import { PageContainer } from '../../common/PageContainer';

export const SearchView: React.FC<{
  title: string,
  icon: IconName,
  iconColor?: string,
  hiddenSearch: SearchQuery,
  defaultSearch: SearchQuery,
  onClickItem?: (item: DataItem) => void;
}> = props => {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({ ...props.hiddenSearch, ...props.defaultSearch });
  const items = useDataSearch(searchQuery);
  const searchInputChangeHandler = useRef<number | undefined>();

  useEffect(() => setSearchQuery(q => ({...q, ...props.hiddenSearch})), [props.hiddenSearch])

  return (
    <PageContainer header={(
      <PageHeader
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
    )}>
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
                    onClick={props.onClickItem ? (() => props.onClickItem?.(items[itemId])) : undefined}
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
    </PageContainer>
  );
};
