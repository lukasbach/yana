import * as React from 'react';
import { TabList } from './TabList';
import { useMainContentContext } from './context';
import { EditorRegistry } from '../../editors/EditorRegistry';
import { isNoteItem } from '../../utils';
import { EditorContainer } from './EditorContainer';

export const MainContainer: React.FC<{}> = props => {
  const mainContent = useMainContentContext();
  console.log(mainContent, "mainContent")

  return (
    <div>
      <TabList />
      {
        mainContent.openTab && (
          isNoteItem(mainContent.openTab.dataItem) && (
            <EditorContainer
              noteItem={mainContent.openTab.dataItem}
              currentContent={mainContent.openTab.currentContent}
              onChangeContent={newContent => {}}
            />
          )
        )
      }
    </div>
  );
};
