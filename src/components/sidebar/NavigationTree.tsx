import * as React from 'react';
import { useState } from 'react';
import { SideBarTreeHeader } from './SideBarTreeHeader';
import { SideBarTreeItemUi } from './SideBarTreeItemUi';
import { DataItemKind } from '../../types';
import { IconName } from '@blueprintjs/core';
import { PageIndex } from '../../PageIndex';
import { useMainContentContext } from '../mainContent/context';

const pages: Array<{ title: string, pageId: PageIndex, icon: IconName }> = [
  { title: 'Home', pageId: PageIndex.Home, icon: 'home' },
  { title: 'Starred', pageId: PageIndex.StarredItems, icon: 'star' },
  { title: 'Files', pageId: PageIndex.FileItems, icon: 'archive' },
  { title: 'Drafts', pageId: PageIndex.DraftItems, icon: 'edit' },
  { title: 'All Items', pageId: PageIndex.AllItems, icon: 'console' },
  { title: 'Search', pageId: PageIndex.Search, icon: 'search' },
]

export const NavigationTree: React.FC<{}> = props => {
  const [isExpanded, setIsExpanded] = useState(true);
  const mainContent = useMainContentContext();

  return (
    <div>
      <SideBarTreeHeader
        title="Yana"
        isExpanded={isExpanded}
        onChangeIsExpanded={setIsExpanded}
      />

      {
        isExpanded && pages.map(page => (
          <SideBarTreeItemUi
            key={page.pageId}
            text={page.title}
            isExpandable={false}
            isExpanded={false}
            onClick={() => mainContent.openInCurrentTab(page.pageId)}
            icon={page.icon}
          />
        ))
      }
    </div>
  );
};
