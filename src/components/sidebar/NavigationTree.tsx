import * as React from 'react';
import { useState } from 'react';
import { SideBarTreeHeader } from './SideBarTreeHeader';
import { SideBarTreeItemUi } from './SideBarTreeItemUi';
import { DataItemKind } from '../../types';
import { IconName } from '@blueprintjs/core';
import { PageIndex } from '../../PageIndex';
import { useMainContentContext } from '../mainContent/context';
import { pages } from '../../pages';
import { useOverlaySearch } from '../overlaySearch/OverlaySearchProvider';
import { SpotlightTarget } from '@atlaskit/onboarding';

const navTreePageIndices = [
  PageIndex.Home,
  PageIndex.StarredItems,
  PageIndex.FileItems,
  PageIndex.DraftItems,
  PageIndex.Trash
];

export const NavigationTree: React.FC<{}> = props => {
  const [isExpanded, setIsExpanded] = useState(true);
  const mainContent = useMainContentContext();
  const overlaySearch = useOverlaySearch();

  return (
    <div>
      <SideBarTreeHeader
        title="Yana"
        onChangeIsExpanded={setIsExpanded}
      />

      {
        isExpanded && (
          <>
            {
              navTreePageIndices.map(idx => [idx, pages[idx]] as const).map(([idx, page]) => (
                <SpotlightTarget name={`sidebar-navigationtree-${idx}`}>
                  <SideBarTreeItemUi
                    key={idx}
                    text={page.title}
                    isExpandable={false}
                    isExpanded={false}
                    onClick={() => mainContent.openInCurrentTab(idx)}
                    icon={page.icon}
                  />
                </SpotlightTarget>
              ))
            }
            <SideBarTreeItemUi
              text={"Search"}
              isExpandable={false}
              isExpanded={false}
              icon="search"
              onClick={() => {
                overlaySearch.performSearch({ buttonText: 'Open' })
                  .then((items) => {
                    if (items) {
                      return mainContent.openInCurrentTab(items[0]);
                    }
                  })
              }}
            />
          </>
        )
      }
    </div>
  );
};
