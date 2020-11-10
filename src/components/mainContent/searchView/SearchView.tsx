import * as React from 'react';
import { Button, IconName, InputGroup, NonIdealState, Popover, Spinner } from '@blueprintjs/core';
import { AutoSizer, Grid } from 'react-virtualized';
import { DataItem, SearchQuery, SearchQuerySortDirection } from '../../../types';
import { PageHeader } from '../../common/PageHeader';
import { useEffect, useRef, useState } from 'react';
import { useDataSearch } from '../../../datasource/useDataSearch';
import { searchViewCellDimensions } from './searchViewCellDimensions';
import { SearchViewCard } from './SearchViewCard';
import { PageContainer } from '../../common/PageContainer';
import { SearchInput } from './SearchInput';
import { SearchSortingMenu } from './SearchSortingMenu';
import { useDataItemPreviews } from '../../../datasource/useDataItemPreviews';
import { LoadingSearchViewCard } from './LoadingSearchViewCard';

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
  const {
    items,
    nextPageAvailable,
    fetchNextPage,
    isFetching
  } = useDataSearch(Object.keys(searchQuery).length === 0 ? { all: true } : searchQuery, 200);
  const previews = useDataItemPreviews(items);
  // TODO currently, all previews are loaded at once. Use Grid.onSectionRendered() to only load previews when they enter the viewport

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
        rightContent={(
          <Popover
            content={(
              <SearchSortingMenu
                searchQuery={hiddenSearch}
                onChange={setHiddenSearch}
              />
            )}
          >
            <Button
              icon={searchQuery.sortDirection === SearchQuerySortDirection.Ascending ? 'sort-asc' : 'sort-desc'}
              outlined
            >
              Sort Items
            </Button>
          </Popover>
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
                const additionalLeftMargin = (width - columnCount * searchViewCellDimensions.cellWidth) / 2;

                if (items.length === 0) {
                  return null; // Provoke non ideal state
                }

                if (itemId >= items.length) {
                  if (!nextPageAvailable) {
                    return null;
                  }

                  fetchNextPage();
                  return (
                    <LoadingSearchViewCard
                      key={cellProps.key}
                      additionalLeftMargin={additionalLeftMargin}
                      containerStyle={cellProps.style}
                    />
                  );
                }

                const item = items[itemId];

                return (
                  <SearchViewCard
                    cellProps={cellProps}
                    dataItem={item}
                    additionalLeftMargin={additionalLeftMargin}
                    onClick={props.onClickItem ? (() => props.onClickItem?.(item)) : undefined}
                    preview={previews[item.id]}
                  />
                );
              }}
              columnWidth={searchViewCellDimensions.cellWidth}
              columnCount={columnCount}
              noContentRenderer={() => (
                isFetching ? (
                  <NonIdealState
                    icon={<Spinner />}
                    title="Loading items..."
                  />
                ) : (
                  <NonIdealState
                    icon={'warning-sign'}
                    title="No items found"
                  />
                )
              )}
              overscanColumnCount={0}
              overscanRowCount={20}
              rowHeight={searchViewCellDimensions.cellHeight}
              rowCount={rowCount + (nextPageAvailable ? 12 : 0)}
              onSectionRendered={section => {}}
              height={height}
              width={width}
            />
          );
        }}
      </AutoSizer>
    </PageContainer>
  );
};
