import * as React from 'react';
import { DataItem, DataItemKind } from '../../types';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { SideBarTreeItemUi } from './SideBarTreeItemUi';
import { useMainContentContext } from '../mainContent/context';
import { Bp3MenuRenderer } from '../menus/Bp3MenuRenderer';
import { DataItemContextMenu } from '../menus/DataItemContextMenu';
import { useSettings } from '../../appdata/AppDataProvider';
import { SettingsObject, SideBarItemAction } from '../../settings/types';
import { IconName } from '@blueprintjs/core';
import { useOverlaySearch } from '../overlaySearch/OverlaySearchProvider';

enum ActionKind { BackgroundClick, MiddleClick, TitleClick }

const getActionPropertyFromSettings = (actionKind: ActionKind, dataItemKind: DataItemKind, settings: SettingsObject) => {
  switch (actionKind) {
    case ActionKind.BackgroundClick:
      switch (dataItemKind) {
        case DataItemKind.NoteItem:
          return settings.sidebarNoteItemBackgroundAction;
        case DataItemKind.Collection:
          return settings.sidebarCollectionItemBackgroundAction;
        case DataItemKind.MediaItem:
          return settings.sidebarMediaItemBackgroundAction;
      }
      break;
    case ActionKind.MiddleClick:
      switch (dataItemKind) {
        case DataItemKind.NoteItem:
          return settings.sidebarNoteItemMiddleClickAction;
        case DataItemKind.Collection:
          return settings.sidebarCollectionItemMiddleClickAction;
        case DataItemKind.MediaItem:
          return settings.sidebarMediaItemMiddleClickAction;
      }
      break;
    case ActionKind.TitleClick:
      switch (dataItemKind) {
        case DataItemKind.NoteItem:
          return settings.sidebarNoteItemNameAction;
        case DataItemKind.Collection:
          return settings.sidebarCollectionItemNameAction;
        case DataItemKind.MediaItem:
          return settings.sidebarMediaItemNameAction;
      }
      break;
  }
}

export const SideBarTreeItem: React.FC<{
  item: DataItem,
  hasChildren: boolean,
  isExpanded: boolean,
  onExpand: () => void,
  onCollapse: () => void,
  isRenaming: boolean,
  onStartRenameItem: (id?: string) => void,
}> = props => {
  const dataInterface = useDataInterface();
  const mainContent = useMainContentContext();
  const overlaySearch = useOverlaySearch();
  const { item, hasChildren, isExpanded, onExpand, onCollapse } = props;
  const settings = useSettings();

  const createOnAction = (action: SideBarItemAction) => () => {
    switch (action) {
      case SideBarItemAction.OpenInCurrentTab:
        mainContent.openInCurrentTab(item);
        break;
      case SideBarItemAction.OpenInNewTab:
        mainContent.newTab(item);
        break;
      case SideBarItemAction.ToggleExpansion:
        if (isExpanded) {
          onCollapse();
        } else {
          onExpand();
        }
        break;

    }
  }

  const menu = (
    <DataItemContextMenu
      item={item}
      renderer={Bp3MenuRenderer}
      onStartRename={() => props.onStartRenameItem(item.id)}
      onCreatedItem={item => props.onStartRenameItem(item.id)}
      dataInterface={dataInterface}
      mainContent={mainContent}
      overlaySearch={overlaySearch}
    />
  );

  let icon: IconName | undefined = item.icon as IconName;

  if (!icon) {
    if (item.kind === DataItemKind.NoteItem) {
      icon = 'document';
    } else if (item.kind === DataItemKind.MediaItem) {
      icon = 'media';
    } else if (isExpanded) {
      icon = 'folder-open';
    } else {
      icon = 'folder-close';
    }
  }

  return (
    <SideBarTreeItemUi
      text={item.name}
      isExpandable={item.kind === DataItemKind.Collection}
      isExpanded={isExpanded}
      isRenaming={props.isRenaming}
      isActive={mainContent.openTab?.dataItem?.id === item.id}
      onRename={name => {
        dataInterface.changeItem(item.id, { ...item, name });
        props.onStartRenameItem(undefined);
      }}
      onClick={createOnAction(getActionPropertyFromSettings(ActionKind.BackgroundClick, item.kind, settings))}
      onMiddleClick={createOnAction(getActionPropertyFromSettings(ActionKind.MiddleClick, item.kind, settings))}
      onTitleClick={createOnAction(getActionPropertyFromSettings(ActionKind.TitleClick, item.kind, settings))}
      menu={menu}
      icon={icon}
      iconColor={item.color}
    />
  );
};
