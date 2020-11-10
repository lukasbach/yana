import * as React from 'react';
import { DataItem, SearchQuery } from '../../types';
import { useDataSearch } from '../../datasource/useDataSearch';
import { SideBarTree } from './SideBarTree';
import { LogService } from '../../common/LogService';
import { useEffect } from 'react';

const logger = LogService.getLogger('SideBarTreeOnSearchQuery');

export const SideBarTreeOnSearchQuery: React.FC<{
  search: SearchQuery,
  title: string,
  masterItem?: DataItem,
}> = props => {
  const { items } = useDataSearch(props.search);

  useEffect(() => logger.log("items changed", [], {items}), [items]);

  if (!items.length) {
    return null;
  }

  return (
    <SideBarTree
      title={props.title}
      rootItems={items}
      masterItem={props.masterItem}
    />
  );
};
