import * as React from 'react';
import { useEffect } from 'react';
import { WorkSpaceSelection } from './WorkSpaceSelection';
import { SearchQuerySortColumn, SearchQuerySortDirection } from '../../types';
import { useDataSearch } from '../../datasource/useDataSearch';
import { InternalTag } from '../../datasource/InternalTag';
import { SideBarTreeOnIds } from './SideBarTreeOnIds';
import { NavigationTree } from './NavigationTree';
import { useSettings } from '../../appdata/AppDataProvider';
import { SideBarTreeOnSearchQuery } from './SideBarTreeOnSearchQuery';
import { SpotlightTarget } from '@atlaskit/onboarding';

export const SideBarContent: React.FC<{}> = props => {
  const searchResult = useDataSearch({ tags: [InternalTag.WorkspaceRoot], limit: 1 });
  const rootCollection = searchResult.items[0];
  const { items: rootChilds } = useDataSearch(rootCollection ? { parents: [rootCollection.id] } : {});
  const settings = useSettings();

  return (
    <>
      <SpotlightTarget name="sidebar-workplace-selection">
        <WorkSpaceSelection />
      </SpotlightTarget>

      <SpotlightTarget name="sidebar-navigation-tree">
        <NavigationTree />
      </SpotlightTarget>

      {settings.sidebarShowRecentItems && (
        <SideBarTreeOnSearchQuery
          search={{
            sortColumn: SearchQuerySortColumn.LastChange,
            sortDirection: SearchQuerySortDirection.Descending,
            limit: settings.sidebarShowRecentItemsCount,
            notTags: [InternalTag.Internal],
          }}
          title="Recent Items"
        />
      )}

      {settings.sidebarShowStarredItems && (
        <SideBarTreeOnSearchQuery
          search={{
            sortColumn: SearchQuerySortColumn.LastChange,
            sortDirection: SearchQuerySortDirection.Descending,
            tags: [InternalTag.Starred],
            limit: settings.sidebarShowStarredItemsCount,
            notTags: [InternalTag.Internal],
          }}
          title="Starred Items"
        />
      )}

      <SpotlightTarget name="sidebar-items">
        <div>
          {rootChilds.map(rootChild => (
            <SideBarTreeOnIds
              key={rootChild.id}
              title={rootChild.name}
              rootItems={rootChild.childIds}
              masterItem={rootChild}
            />
          ))}
        </div>
      </SpotlightTarget>
    </>
  );
};
