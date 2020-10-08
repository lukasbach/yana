import * as React from 'react';
import { useMainContentContext } from './context';
import { isCollectionItem, isNoteItem } from '../../utils';
import { LogService } from '../../common/LogService';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { CollectionContainer } from './CollectionContainer';
import { NoteContainer } from './NoteContainer';
import { PageIndex } from '../../PageIndex';
import { StarredItems } from '../pages/StarredItems';
import { DraftItems } from '../pages/DraftItems';
import { FileItems } from '../pages/FileItems';
import { AllItems } from '../pages/AllItems';
import { ManageWorkspaces } from '../pages/ManageWorkspaces';

const logger = LogService.getLogger('MainContainer');

export const MainContainer: React.FC<{}> = props => {
  const mainContent = useMainContentContext();
  const dataInterface = useDataInterface();
  logger.log("rerender", [], {mainContent})

  if (mainContent.openTab?.page) {
    switch(mainContent.openTab.page) {
      case PageIndex.StarredItems:
        return <StarredItems />;
      case PageIndex.DraftItems:
        return <DraftItems />;
      case PageIndex.FileItems:
        return <FileItems />;
      case PageIndex.AllItems:
        return <AllItems />;
      case PageIndex.ManageWorkspaces:
        return <ManageWorkspaces />
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
