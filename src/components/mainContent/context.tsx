import { DataItem, DataItemKind } from '../../types';
import React, { useContext, useEffect, useState } from 'react';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { useAsyncEffect } from '../../utils';
import { LogService } from '../../common/LogService';

const logger = LogService.getLogger('MainContainerContext');

export interface MainContentContextValue {
  tabs: TabData[];
  openTabId: number;
  openTab?: TabData;
}

export interface MainContentContextActions {
  newTab: (dataItem: DataItem) => Promise<void>;
  openInCurrentTab: (dataItem: DataItem) => Promise<void>;
  changeTabContent: (tabId: number, content: object) => void;
  closeTab: (tabId: number) => Promise<void>;
  reorderTab: (from: number, to: number) => Promise<void>;
  activateTab: (tabId: number) => Promise<void>;
}

export interface TabData {
  dataItem: DataItem;
  currentContent?: any;
  scrollPosition: number;
}

export const MainContentContext = React.createContext<MainContentContextValue & MainContentContextActions>(null as any);

export const useMainContentContext = () => useContext(MainContentContext);

export const MainContentContextProvider: React.FC = props => {
  const dataInterface = useDataInterface();
  const [get, set] = useState<Omit<MainContentContextValue, 'openTab'>>({
    tabs: [],
    openTabId: 0
  });

  const tryToOpenInExistingTab = (dataItem: DataItem) => {
    const tab = get.tabs.findIndex(tab => tab.dataItem.id === dataItem.id);
    if (tab === -1) {
      return false;
    } else {
      logger.out("Tab is already open, switching to it", [], {dataItem, tab});
      set(old => ({ ...old, openTabId: tab }));
      return true;
    }
  }

  const actions: MainContentContextActions = {
    changeTabContent: async (tabId, content) => {
      logger.out("Writing tab contents for", [tabId], {content});
      set(old => ({
        ...old,
        tabs: old.tabs.map((tab, idx) => idx !== tabId ? tab : {
          ...tab,
          currentContent: content
        })
      }));
    },
    newTab: async (dataItem) => {
      logger.out("Loading new tab", [dataItem.name])

      if (tryToOpenInExistingTab(dataItem)) return;

      if (dataItem.kind === DataItemKind.NoteItem) {
        const currentContent = await dataInterface.getNoteItemContent(dataItem.id);
        logger.out("Loaded tab contents", [dataItem.name], {currentContent})
        set(old => ({
          ...old,
          openTabId: old.tabs.length,
          tabs: [
            ...old.tabs,
            {
              dataItem,
              currentContent,
              scrollPosition: 0
            }
          ]
        }));
      } else {
        // TODO
      }
    },
    openInCurrentTab: async (dataItem) => {
      if (!get.tabs.length) {
        return await actions.newTab(dataItem);
      }

      if (tryToOpenInExistingTab(dataItem)) return;

      logger.out("Loading in current tab", [dataItem.name])

      if (dataItem.kind === DataItemKind.NoteItem) {
        const currentContent = await dataInterface.getNoteItemContent(dataItem.id);
        logger.out("Loaded tab contents", [dataItem.name], {currentContent})
        set(old => ({
          ...old,
          tabs: old.tabs.map((tab, id) => id !== old.openTabId ? tab : {
            dataItem,
            currentContent,
            scrollPosition: 0
          }),
        }));
      } else {
        // TODO
      }
    },
    closeTab: async (tabId) => {
      set(old => ({
        openTabId: old.openTabId === tabId ? 0 : old.openTabId,
        tabs: old.tabs.filter((tab, id) => id !== tabId)
      }));
    },
    reorderTab: async (from, to) => {
      // TODO
    },
    activateTab: async (tabId) => {
      set(old => ({
        ...old,
        openTabId: tabId
      }));
    }
  };

  // TODO remove
  useAsyncEffect(async () => {
    actions.newTab(await dataInterface.getDataItem('newnote item'));
    actions.newTab(await dataInterface.getDataItem('newnote item2'));
    actions.newTab(await dataInterface.getDataItem('newnote item3'));
  }, [])

  return (
    <MainContentContext.Provider value={{ ...get, ...actions, openTab: get.tabs[get.openTabId] }}>
      { props.children }
    </MainContentContext.Provider>
  )
}