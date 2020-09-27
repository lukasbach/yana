import { DataItem, DataItemKind } from '../../types';
import React, { useContext, useEffect, useState } from 'react';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { useAsyncEffect } from '../../utils';
import { LogService } from '../../common/LogService';
import { useEventChangeHandler } from '../../common/useEventChangeHandler';
import { ItemChangeEventReason } from '../../datasource/DataInterface';

const logger = LogService.getLogger('MainContainerContext');

export interface MainContentContextValue {
  tabs: TabData[];
  openTabId: number;
  openTab?: TabData;
}

export interface MainContentContextActions {
  newTab: (dataItemOrPage: DataItem | string) => Promise<void>;
  openInCurrentTab: (dataItemOrPage: DataItem | string) => Promise<void>;
  changeTabContent: (tabId: number, content: object) => void;
  closeTab: (tabId: number) => Promise<void>;
  reorderTab: (from: number, to: number) => Promise<void>;
  activateTab: (tabId: number) => Promise<void>;
}

export interface TabData {
  dataItem?: DataItem;
  page?: string;
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

  const tryToOpenInExistingTab = (dataItemOrPage: DataItem | string) => {
    const tab = get.tabs.findIndex(tab => typeof dataItemOrPage === 'string'
      ? tab.page === dataItemOrPage : tab.dataItem?.id === dataItemOrPage.id);
    if (tab === -1) {
      return false;
    } else {
      logger.out("Tab is already open, switching to it", [], {dataItemOrPage: dataItemOrPage, tab});
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
    newTab: async (dataItemOrPage) => {
      logger.out("Loading new tab", [typeof dataItemOrPage === 'string' ? dataItemOrPage : dataItemOrPage.name])

      if (tryToOpenInExistingTab(dataItemOrPage)) return;

      if (typeof dataItemOrPage === 'string') {
        set(old => ({
          ...old,
          openTabId: old.tabs.length,
          tabs: [
            ...old.tabs,
            {
              page: dataItemOrPage,
              scrollPosition: 0
            }
          ]
        }));
      } else if (dataItemOrPage.kind === DataItemKind.NoteItem) {
        const currentContent = await dataInterface.getNoteItemContent(dataItemOrPage.id);
        logger.out("Loaded tab contents", [dataItemOrPage.name], {currentContent})
        set(old => ({
          ...old,
          openTabId: old.tabs.length,
          tabs: [
            ...old.tabs,
            {
              dataItem: dataItemOrPage,
              currentContent,
              scrollPosition: 0
            }
          ]
        }));
      } else {
        set(old => ({
          ...old,
          openTabId: old.tabs.length,
          tabs: [
            ...old.tabs,
            {
              dataItem: dataItemOrPage,
              scrollPosition: 0
            }
          ]
        }));
      }
    },
    openInCurrentTab: async (dataItemOrPage) => {
      if (!get.tabs.length) {
        return await actions.newTab(dataItemOrPage);
      }

      if (tryToOpenInExistingTab(dataItemOrPage)) return;

      logger.out("Loading in current tab", [typeof dataItemOrPage === 'string' ? dataItemOrPage : dataItemOrPage.name])

      if (typeof dataItemOrPage === 'string') {
        set(old => ({
          ...old,
          tabs: old.tabs.map((tab, id) => id !== old.openTabId ? tab : {
            page: dataItemOrPage,
            scrollPosition: 0
          }),
        }));
      } else if (dataItemOrPage.kind === DataItemKind.NoteItem) {
        const currentContent = await dataInterface.getNoteItemContent(dataItemOrPage.id);
        logger.out("Loaded tab contents", [dataItemOrPage.name], {currentContent})
        set(old => ({
          ...old,
          tabs: old.tabs.map((tab, id) => id !== old.openTabId ? tab : {
            dataItem: dataItemOrPage,
            currentContent,
            scrollPosition: 0
          }),
        }));
      } else {
        set(old => ({
          ...old,
          tabs: old.tabs.map((tab, id) => id !== old.openTabId ? tab : {
            dataItem: dataItemOrPage,
            scrollPosition: 0
          }),
        }));
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
    actions.newTab(await dataInterface.getDataItem('new note item2'));
    actions.newTab(await dataInterface.getDataItem('new note item3'));
    actions.newTab(await dataInterface.getDataItem('welcometo yana'));
    actions.newTab(await dataInterface.getDataItem('new collection3'));
  }, []);

  useEventChangeHandler(dataInterface.onChangeItems, async payload => {
    for (const { reason, id } of payload) {
      switch (reason) {
        case ItemChangeEventReason.Removed:
          if (get.tabs.find(tab => tab.dataItem?.id === id)) {
            set(value => ({ ...value, tabs: value.tabs.filter(tab => !tab.dataItem || tab.dataItem.id !== id) }));
          }
          break;
        case ItemChangeEventReason.Changed:
          if (get.tabs.find(tab => tab.dataItem?.id === id)) {
            const changed = await dataInterface.getDataItem(id);
            set(value => ({ ...value, tabs: value.tabs.map(tab => tab.dataItem?.id === id ? ({ ...tab, dataItem: changed }) : tab) }));
          }
          break;
        case ItemChangeEventReason.ChangedNoteContents:
          // TODO handle here instead of action above?
          break;

      }
    }
  }, [get]);

  return (
    <MainContentContext.Provider value={{ ...get, ...actions, openTab: get.tabs[get.openTabId] }}>
      { props.children }
    </MainContentContext.Provider>
  )
}