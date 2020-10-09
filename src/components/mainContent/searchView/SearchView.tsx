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
import { SearchInput } from './SearchInput';

export const SearchView: React.FC<{
  title: string,
  icon: IconName,
  iconColor?: string,
  hiddenSearch: SearchQuery,
  defaultSearch: SearchQuery,
  onClickItem?: (item: DataItem) => void;
}> = props => {
  const [hiddenSearch, setHiddenSearch] = useState(props.hiddenSearch);
  const [userSearch, setUserSearch] = useState(props.defaultSearch);
  // const [searchQuery, setSearchQuery] = useState<SearchQuery>({ ...props.hiddenSearch, ...props.defaultSearch });
  const searchQuery = { ...hiddenSearch, ...userSearch };
  const items = useDataSearch(Object.keys(searchQuery).length === 0 ? { all: true } : searchQuery);

  useEffect(() => setHiddenSearch(q => ({...q, ...props.hiddenSearch})), [props.hiddenSearch]);
  useEffect(() => setUserSearch(q => ({...q, ...props.defaultSearch})), [props.defaultSearch]);

  return (
    <PageContainer header={(
      <PageHeader
        title={props.title}
        icon={props.icon}
        iconColor={props.iconColor}
        lowerContent={(
          <SearchInput onChangeSearchQuery={setUserSearch} />
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
