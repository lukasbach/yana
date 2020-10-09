import * as React from 'react';
import { useState } from 'react';
import { NoteDataItem } from '../../types';
import { EditorHeader } from './EditorHeader';
import { EditorContainer, SaveIndicatorState } from './EditorContainer';
import { useMainContentContext } from './context';
import { useDataInterface } from '../../datasource/DataInterfaceContext';

export const NoteContainer: React.FC<{
  dataItem: NoteDataItem<any>;
  currentContent: any;
}> = ({ dataItem, currentContent }) => {
  const mainContent = useMainContentContext();
  const dataInterface = useDataInterface();
  const [saveIndicator, setSaveIndicator] = useState<SaveIndicatorState>(SaveIndicatorState.Saved);

  return (
    <>
      <EditorHeader
        dataItem={dataItem}
        onChange={changed => dataInterface.changeItem(changed.id, changed)}
        saveIndicator={saveIndicator}
      />
      <EditorContainer
        key={dataItem.id} // TODO inefficient but required for properly rerendering editors?
        noteItem={dataItem}
        currentContent={currentContent}
        onChangeSaveIndicatorState={setSaveIndicator}
        onChangeContent={(noteId, newContent) => {
          const savingTab = mainContent.tabs.findIndex(tab => tab.dataItem?.id === noteId);
          if (savingTab) {
            mainContent.changeTabContent(savingTab, newContent);
          }
        }}
      />
    </>
  );
};