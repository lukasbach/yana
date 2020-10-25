import { SettingsObject, SideBarItemAction } from './types';

export const defaultSettings: SettingsObject = {
  autoBackupActive: true,
  autoBackupCount: 3,
  autoBackupIncludeMedia: true,
  autoBackupInterval: 1000 * 60 * 60 * 12,
  autoUpdateAppActive: true,
  autoUpdateAppBackupActive: true,
  noteItemMaximumSaveInterval: 1000 * 60,
  noteItemSaveDelay: 1000 * 10,
  sidebarCollectionItemBackgroundAction: SideBarItemAction.ToggleExpansion,
  sidebarCollectionItemMiddleClickAction: SideBarItemAction.OpenInNewTab,
  sidebarCollectionItemNameAction: SideBarItemAction.OpenInCurrentTab,
  sidebarMediaItemBackgroundAction: SideBarItemAction.OpenInCurrentTab,
  sidebarMediaItemMiddleClickAction: SideBarItemAction.OpenInNewTab,
  sidebarMediaItemNameAction: SideBarItemAction.OpenInCurrentTab,
  sidebarNoteItemBackgroundAction: SideBarItemAction.OpenInCurrentTab,
  sidebarNoteItemMiddleClickAction: SideBarItemAction.OpenInNewTab,
  sidebarNoteItemNameAction: SideBarItemAction.OpenInCurrentTab,
}