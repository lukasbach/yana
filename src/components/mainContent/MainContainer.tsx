import * as React from 'react';
import { useMainContentContext } from './context';
import { EditorRegistry } from '../../editors/EditorRegistry';
import { isCollectionItem, isNoteItem } from '../../utils';
import { EditorContainer } from './EditorContainer';
import { LogService } from '../../common/LogService';
import { EditorHeader } from './EditorHeader';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { CollectionContainer } from './CollectionContainer';
import { NoteContainer } from './NoteContainer';
import { PageIndex } from '../../PageIndex';
import { StarredItems } from './StarredItems';

const logger = LogService.getLogger('MainContainer');

export const MainContainer: React.FC<{}> = props => {
  const mainContent = useMainContentContext();
  const dataInterface = useDataInterface();
  logger.log("rerender", [], {mainContent})

  if (mainContent.openTab?.page) {
    switch(mainContent.openTab.page) {
      case PageIndex.StarredItems:
        return <StarredItems />
      default:
        return <>Unknown page</>;
    }
  } else if (mainContent.openTab?.dataItem) {
    if (isNoteItem(mainContent.openTab.dataItem)) {
      return (
        <NoteContainer
          dataItem={mainContent.openTab.dataItem}
          currentContent={mainContent.openTab.currentContent}
        />
      );
    } else if (isCollectionItem(mainContent.openTab.dataItem)) {
      return (
        <CollectionContainer
          dataItem={mainContent.openTab.dataItem}
        />
      );
    } else {
      return <>Unknown data type</>;
    }
  } else {
    return <>Invalid tab</>;
  }
};
