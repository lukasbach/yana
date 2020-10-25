import { PageIndex } from './PageIndex';
import { IconName } from '@blueprintjs/core';
import { ReactNode } from 'react';
import React from 'react';
import { StarredItems } from './components/pages/StarredItems';
import { DraftItems } from './components/pages/DraftItems';
import { FileItems } from './components/pages/FileItems';
import { AllItems } from './components/pages/AllItems';
import { ManageWorkspaces } from './components/pages/ManageWorkspaces';
import { TrashItems } from './components/pages/TrashItems';
import { Settings } from './components/settings/Settings';
import { AboutContainerPage } from './components/settings/about/AboutContainerPage';

export const pages: { [key in PageIndex]: { title: string, icon: IconName, content: () => ReactNode } } = {
  [PageIndex.Home]: { title: 'Home', icon: 'home', content: () => '' },
  [PageIndex.StarredItems]: { title: 'Starred', icon: 'star', content: () => <StarredItems /> },
  [PageIndex.FileItems]: { title: 'Files', icon: 'archive', content: () => <FileItems /> },
  [PageIndex.DraftItems]: { title: 'Drafts', icon: 'edit', content: () => <DraftItems /> },
  [PageIndex.AllItems]: { title: 'All Items', icon: 'layout-grid', content: () => <AllItems /> },
  [PageIndex.Search]: { title: 'Search', icon: 'search', content: () => '' },
  [PageIndex.Trash]: { title: 'Trash', icon: 'trash', content: () => <TrashItems /> },
  [PageIndex.Settings]: { title: 'Settings', icon: 'cog', content: () => <Settings /> },
  [PageIndex.ManageWorkspaces]: { title: 'Workspaces', icon: 'cog', content: () => <ManageWorkspaces /> },
  [PageIndex.About]: { title: 'About Yana', icon: 'help', content: () => <AboutContainerPage /> },
};
