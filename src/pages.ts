import { PageIndex } from './PageIndex';
import { IconName } from '@blueprintjs/core';

export const pages: { [key in PageIndex]: { title: string, icon: IconName } } = {
  [PageIndex.Home]: { title: 'Home', icon: 'home' },
  [PageIndex.StarredItems]: { title: 'Starred', icon: 'star' },
  [PageIndex.FileItems]: { title: 'Files', icon: 'archive' },
  [PageIndex.DraftItems]: { title: 'Drafts', icon: 'edit' },
  [PageIndex.AllItems]: { title: 'All Items', icon: 'layout-grid' },
  [PageIndex.Search]: { title: 'Search', icon: 'search' },
  [PageIndex.Trash]: { title: 'Trash', icon: 'trash' },
  [PageIndex.Settings]: { title: 'Settings', icon: 'cog' },
}