import * as React from 'react';
import { NoteDataItem } from '../../types';
import { EditorHeader } from './EditorHeader';
import { EditorContainer } from './EditorContainer';
import { useMainContentContext } from './context';
import { useDataInterface } from '../../datasource/DataInterfaceContext';

export const NoteContainer: React.FC<{
  dataItem: NoteDataItem<any>;
  currentContent: any;
}> = ({ dataItem, currentContent }) => {
  const mainContent = useMainContentContext();
  const dataInterface = useDataInterface();

  return (
    <>
      <EditorHeader
        dataItem={dataItem}
        onChange={changed => dataInterface.changeItem(changed.id, changed)}
      />
      <EditorContainer
        noteItem={dataItem}
        currentContent={currentContent}
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