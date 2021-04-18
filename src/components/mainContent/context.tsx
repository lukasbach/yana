import { DataItem, DataItemKind } from '../../types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { useAsyncEffect } from '../../utils';
import { LogService } from '../../common/LogService';
import { useEventChangeHandler } from '../../common/useEventChangeHandler';
import { ItemChangeEventReason } from '../../datasource/DataInterface';
import { PageIndex } from '../../PageIndex';
import { useCloseEvent } from '../../common/useCloseEvent';

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

export type MainContentContextType = MainContentContextValue & MainContentContextActions;

export interface TabData {
  dataItem?: DataItem;
  page?: PageIndex;
  currentContent?: any;
  scrollPosition: number;
}

interface SessionStructure {
  tabs: Array<{ page?: string; dataItem?: string }>;
  openTabId: number;
}

export const MainContentContext = React.createContext<MainContentContextType>(null as any);

export const useMainContentContext = () => useContext(MainContentContext);

export const MainContentContextProvider: React.FC = props => {
  const dataInterface = useDataInterface();
  const dirty = useRef(false);
  const saveHandler = useRef<number | undefined>();
  const [get, set] = useState<Omit<MainContentContextValue, 'openTab'>>({
    tabs: [],
    openTabId: 0,
  });
  const currentState = useRef(get);
  useEffect(() => {
    currentState.current = get;
  }, [get]);

  const saveTabs = async () => {
    logger.log('Start saving tabs', [], { tabs: currentState.current.tabs, openTabId: currentState.current.openTabId });
    await dataInterface.storeStructure<SessionStructure>('sessiontabs', {
      tabs: currentState.current.tabs.map(tab => ({ page: tab.page, dataItem: tab.dataItem?.id })),
      openTabId: currentState.current.openTabId,
    });
    logger.log('Finished saving tabs');
  };

  // useEffect(() => {
  //   dirty.current = true;
  //   saveHandler.current = setTimeout(() => saveTabs(), 10000) as any;
  // }, [get]);

  const tryToOpenInExistingTab = (dataItemOrPage: DataItem | string) => {
    const tab = get.tabs.findIndex(tab =>
      typeof dataItemOrPage === 'string' ? tab.page === dataItemOrPage : tab.dataItem?.id === dataItemOrPage.id
    );
    if (tab === -1) {
      return false;
    } else {
      logger.out('Tab is already open, switching to it', [], { dataItemOrPage: dataItemOrPage, tab });
      set(old => ({ ...old, openTabId: tab }));
      return true;
    }
  };

  const actions: MainContentContextActions = {
    changeTabContent: async (tabId, content) => {
      logger.out('Writing tab contents for', [tabId], { content });
      set(old => ({
        ...old,
        tabs: old.tabs.map((tab, idx) =>
          idx !== tabId
            ? tab
            : {
                ...tab,
                currentContent: content,
              }
        ),
      }));
    },
    newTab: async dataItemOrPage => {
      logger.out('Loading new tab', [typeof dataItemOrPage === 'string' ? dataItemOrPage : dataItemOrPage.name]);

      if (tryToOpenInExistingTab(dataItemOrPage)) return;

      if (typeof dataItemOrPage === 'string') {
        set(old => ({
          ...old,
          openTabId: old.tabs.length,
          tabs: [
            ...old.tabs,
            {
              page: dataItemOrPage as PageIndex,
              scrollPosition: 0,
            },
          ],
        }));
      } else if (dataItemOrPage.kind === DataItemKind.NoteItem) {
        const currentContent = await dataInterface.getNoteItemContent(dataItemOrPage.id);
        const currentItem = await dataInterface.getDataItem(dataItemOrPage.id);
        logger.out('Loaded tab contents', [dataItemOrPage.name], { currentContent });
        set(old => ({
          ...old,
          openTabId: old.tabs.length,
          tabs: [
            ...old.tabs,
            {
              dataItem: currentItem,
              currentContent,
              scrollPosition: 0,
            },
          ],
        }));
      } else {
        const currentItem = await dataInterface.getDataItem(dataItemOrPage.id);
        set(old => ({
          ...old,
          openTabId: old.tabs.length,
          tabs: [
            ...old.tabs,
            {
              dataItem: currentItem,
              scrollPosition: 0,
            },
          ],
        }));
      }
    },
    openInCurrentTab: async dataItemOrPage => {
      if (!get.tabs.length) {
        return await actions.newTab(dataItemOrPage);
      }

      if (tryToOpenInExistingTab(dataItemOrPage)) return;

      logger.out('Loading in current tab', [typeof dataItemOrPage === 'string' ? dataItemOrPage : dataItemOrPage.name]);

      if (typeof dataItemOrPage === 'string') {
        set(old => ({
          ...old,
          tabs: old.tabs.map((tab, id) =>
            id !== old.openTabId
              ? tab
              : {
                  page: dataItemOrPage as PageIndex,
                  scrollPosition: 0,
                }
          ),
        }));
      } else if (dataItemOrPage.kind === DataItemKind.NoteItem) {
        const currentContent = await dataInterface.getNoteItemContent(dataItemOrPage.id);
        const currentItem = await dataInterface.getDataItem(dataItemOrPage.id);
        logger.out('Loaded tab contents', [dataItemOrPage.name], { currentContent });
        set(old => ({
          ...old,
          tabs: old.tabs.map((tab, id) =>
            id !== old.openTabId
              ? tab
              : {
                  dataItem: currentItem,
                  currentContent,
                  scrollPosition: 0,
                }
          ),
        }));
      } else {
        const currentItem = await dataInterface.getDataItem(dataItemOrPage.id);
        set(old => ({
          ...old,
          tabs: old.tabs.map((tab, id) =>
            id !== old.openTabId
              ? tab
              : {
                  dataItem: currentItem,
                  scrollPosition: 0,
                }
          ),
        }));
      }
    },
    closeTab: async tabId => {
      set(old => ({
        openTabId: old.openTabId === tabId ? 0 : old.openTabId,
        tabs: old.tabs.filter((tab, id) => id !== tabId),
      }));
    },
    reorderTab: async (from, to) => {
      set(old => {
        let openTabId = old.openTabId;

        if (openTabId === from) {
          logger.log('User is moving currently opened tab', [], { openTabId, from, to, oldOpenTabId: old.openTabId });
          openTabId = to;
        } else if (from < openTabId && to < openTabId) {
          logger.log('User is moving tab from and to in front of open tab, noop', [], {
            openTabId,
            from,
            to,
            oldOpenTabId: old.openTabId,
          });
        } else if (to > openTabId && from > openTabId) {
          logger.log('User is moving tab from and to after end of open tab, noop', [], {
            openTabId,
            from,
            to,
            oldOpenTabId: old.openTabId,
          });
        } else if (from < openTabId && to >= openTabId) {
          openTabId--;
          logger.log('User is moving tab from before to after open tab', [], {
            openTabId,
            from,
            to,
            oldOpenTabId: old.openTabId,
          });
        } else if (from > openTabId && to <= openTabId) {
          openTabId++;
          logger.log('User is moving tab from after to before open tab', [], {
            openTabId,
            from,
            to,
            oldOpenTabId: old.openTabId,
          });
        }

        return {
          ...old,
          // openTabId: old.openTabId === from ? to : to > old.openTabId ? old.openTabId + 1 : from < old.openTabId ? old.openTabId - 1 : old.openTabId,
          openTabId,
          tabs: [
            ...old.tabs.filter((tab, idx) => idx !== from).filter((tab, idx) => idx < to),
            old.tabs[from],
            ...old.tabs.filter((tab, idx) => idx !== from).filter((tab, idx) => idx >= to),
          ],
        };
      });
    },
    activateTab: async tabId => {
      set(old => ({
        ...old,
        openTabId: tabId,
      }));
    },
  };

  useEffect(() => {
    logger.log('context reload');
    (async () => {
      const session = await dataInterface.getStructure<SessionStructure>('sessiontabs');
      for (const tab of session.tabs) {
        if (tab.page || tab.dataItem) {
          await actions.newTab(tab.page ?? (await dataInterface.getDataItem(tab.dataItem!)));
        }
      }
      actions.activateTab(session.openTabId);
    })();

    return () => {
      logger.log('context exit', [], { get, currentState });
      saveTabs().then(() => dataInterface.persist());
    };
  }, []);

  useCloseEvent(async () => {
    logger.log('app close', [], { get, currentState });
    await saveTabs();
    await dataInterface.persist();
  }, [get]);

  useEventChangeHandler(
    dataInterface.onChangeItems,
    async payload => {
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
              set(value => ({
                ...value,
                tabs: value.tabs.map(tab => (tab.dataItem?.id === id ? { ...tab, dataItem: changed } : tab)),
              }));
            }
            break;
          case ItemChangeEventReason.ChangedNoteContents:
            // TODO handle here instead of action above?
            break;
        }
      }
    },
    [get]
  );

  return (
    <MainContentContext.Provider value={{ ...get, ...actions, openTab: get.tabs[get.openTabId] }}>
      {props.children}
    </MainContentContext.Provider>
  );
};
