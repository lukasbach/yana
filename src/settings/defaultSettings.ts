import { SettingsObject, SideBarItemAction } from './types';
import path from "path";
import { remote } from "electron";

export const defaultSettings: SettingsObject = {
  editorAtlassianAdvancedTables: true,
  editorMonacoMinimap: true,
  editorMonacoRenderControlChars: false,
  editorMonacoRenderWhitespace: 'none',
  editorMonacoRuler: 0,
  editorMonacoTabSize: 4,
  editorMonacoTheme: 'vs',
  editorMonacoWordWrap: 'off',
  autoBackupLocation: path.join(remote.app.getPath('appData'), 'yana', 'backup'),
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
  sidebarNumberOfUntruncatedItems: 5,
  sidebarOffsetPerLevel: 16,
}