import * as React from 'react';
import { useState } from 'react';
import { SideBarTreeHeader } from './SideBarTreeHeader';
import { SideBarTreeItemUi } from './SideBarTreeItemUi';
import { DataItemKind } from '../../types';
import { IconName } from '@blueprintjs/core';
import { PageIndex } from '../../PageIndex';
import { useMainContentContext } from '../mainContent/context';
import { pages } from '../../pages';

const navTreePageIndices = [
  PageIndex.Home,
  PageIndex.StarredItems,
  PageIndex.FileItems,
  PageIndex.DraftItems,
  PageIndex.AllItems,
  PageIndex.Trash
];

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
        isExpanded && navTreePageIndices.map(idx => [idx, pages[idx]] as const).map(([idx, page]) => (
          <SideBarTreeItemUi
            key={idx}
            text={page.title}
            isExpandable={false}
            isExpanded={false}
            onClick={() => mainContent.openInCurrentTab(idx)}
            icon={page.icon}
          />
        ))
      }
    </div>
  );
};
