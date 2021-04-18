import * as React from 'react';
import { useState } from 'react';
import { NoteDataItem } from '../../types';
import { EditorHeader } from './EditorHeader';
import { EditorContainer, SaveIndicatorState } from './EditorContainer';
import { useMainContentContext } from './context';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import cxs from 'cxs';

const styles = {
  container: cxs({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  }),
  editorContainer: cxs({
    flexGrow: 1,
    position: 'relative',
  }),
};

export const NoteContainer: React.FC<{
  dataItem: NoteDataItem<any>;
  currentContent: any;
}> = ({ dataItem, currentContent }) => {
  const mainContent = useMainContentContext();
  const dataInterface = useDataInterface();
  const [saveIndicator, setSaveIndicator] = useState<SaveIndicatorState>(SaveIndicatorState.Saved);

  return (
    <div className={styles.container}>
      <EditorHeader
        dataItem={dataItem}
        onChange={changed => dataInterface.changeItem(changed.id, changed)}
        saveIndicator={saveIndicator}
      />
      <div className={styles.editorContainer}>
        <EditorContainer
          key={dataItem.id} // TODO inefficient but required for properly rerendering editors?
          noteItem={dataItem}
          currentContent={currentContent}
          onChangeSaveIndicatorState={setSaveIndicator}
          onChangeContent={(noteId, newContent) => {
            const savingTab = mainContent.tabs.findIndex(tab => tab.dataItem?.id === noteId);
            if (savingTab !== undefined) {
              mainContent.changeTabContent(savingTab, newContent);
            }
          }}
        />
      </div>
    </div>
  );
};
