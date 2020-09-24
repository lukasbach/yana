import * as React from 'react';
import { TabList } from './TabList';
import { useMainContentContext } from './context';
import { EditorRegistry } from '../../editors/EditorRegistry';
import { isNoteItem } from '../../utils';
import { EditorContainer } from './EditorContainer';
import { LogService } from '../../common/LogService';
import { EditorHeader } from './EditorHeader';
import { useDataInterface } from '../../datasource/DataInterfaceContext';

const logger = LogService.getLogger('MainContainer');

export const MainContainer: React.FC<{}> = props => {
  const mainContent = useMainContentContext();
  const dataInterface = useDataInterface();
  logger.log("rerender", [], {mainContent})

  return (
    <div>
      {
        mainContent.openTab && (
          isNoteItem(mainContent.openTab.dataItem) && (
            <>
              <EditorHeader
                dataItem={mainContent.openTab.dataItem}
                onChange={changed => dataInterface.changeItem(changed.id, changed)}
              />
              <EditorContainer
                noteItem={mainContent.openTab.dataItem}
                currentContent={mainContent.openTab.currentContent}
                onChangeContent={(noteId, newContent) => {
                  const savingTab = mainContent.tabs.findIndex(tab => tab.dataItem.id === noteId);
                  if (savingTab) {
                    mainContent.changeTabContent(savingTab, newContent);
                  }
                }}
              />
            </>
          )
        )
      }
    </div>
  );
};
