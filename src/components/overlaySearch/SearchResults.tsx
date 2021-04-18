import * as React from 'react';
import { OVERLAY_SEARCH_ITEM_HEIGHT, ResultItem } from './ResultItem';
import { useSearchBar } from '../searchbar/SearchBar';
import { useDataSearch } from '../../datasource/useDataSearch';
import { AutoSizer, List } from 'react-virtualized';
import { PageContainer } from '../common/PageContainer';
import { DataItem, DataItemKind, SearchQuery } from '../../types';
import ago from 's-ago';
import { Spinner } from '@blueprintjs/core';

export const SearchResults: React.FC<{
  onClickItem?: (item: DataItem) => void;
  hideItemIds: string[];
  hiddenSearch: SearchQuery;
}> = props => {
  const search = useSearchBar();
  const searchResult = useDataSearch({ ...search.searchQuery, ...props.hiddenSearch }, 30);

  const items = searchResult.items.filter(i => !props.hideItemIds.includes(i.id));

  return (
    <AutoSizer>
      {({ width, height }) => {
        return (
          <List
            rowCount={items.length + (searchResult.nextPageAvailable ? 50 : 0)}
            rowHeight={OVERLAY_SEARCH_ITEM_HEIGHT}
            width={width}
            height={height}
            containerStyle={{ paddingRight: '10px' }}
            rowRenderer={cellProps => {
              const itemId = cellProps.index;

              if (itemId >= items.length) {
                if (searchResult.nextPageAvailable) {
                  searchResult.fetchNextPage();
                  return (
                    <ResultItem
                      key={cellProps.key}
                      containerStyle={cellProps.style}
                      icon={<Spinner size={16} />}
                      title="Loading..."
                      meta=""
                    />
                  );
                } else {
                  return null;
                }
              }

              const item = items[itemId];

              return (
                <ResultItem
                  key={cellProps.key}
                  containerStyle={cellProps.style}
                  icon={(item.icon || (item.kind === DataItemKind.Collection ? 'folder-open' : 'document')) as any}
                  title={item.name}
                  meta={ago(new Date(item.lastChange))}
                  onClick={() => props.onClickItem?.(item)}
                  dataItem={item}
                />
              );
            }}
          />
        );
      }}
    </AutoSizer>
  );
};
