import * as React from 'react';
import { useMainContentContext } from './context';
import { isCollectionItem, isMediaItem, isNoteItem } from '../../utils';
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
import { TrashItems } from '../pages/TrashItems';
import { pages } from '../../pages';
import { ReactNode } from 'react';
import { MediaView } from './MediaView';
import { Button, NonIdealState } from '@blueprintjs/core';
import { InternalTag } from '../../datasource/InternalTag';
import { DataItemKind } from '../../types';

const logger = LogService.getLogger('MainContainer');

export const MainContainer: React.FC<{}> = props => {
  const mainContent = useMainContentContext();
  const dataInterface = useDataInterface();
  logger.log('rerender', [], { mainContent });

  if (mainContent.openTab?.page) {
    return (pages[mainContent.openTab.page]?.content() || '') as any;
  } else if (mainContent.openTab?.dataItem) {
    if (isNoteItem(mainContent.openTab.dataItem)) {
      return (
        <NoteContainer dataItem={mainContent.openTab.dataItem} currentContent={mainContent.openTab.currentContent} />
      );
    } else if (isCollectionItem(mainContent.openTab.dataItem)) {
      return <CollectionContainer dataItem={mainContent.openTab.dataItem} />;
    } else if (isMediaItem(mainContent.openTab.dataItem)) {
      return <MediaView dataItem={mainContent.openTab.dataItem} />;
    } else {
      return <>Unknown data type</>;
    }
  } else {
    return (
      <NonIdealState
        icon={'home'}
        title="Welcome to Yana!"
        description="It looks like you don't have any tabs open."
        action={
          <>
            <Button icon={'home'} minimal onClick={() => mainContent.newTab(PageIndex.Home)}>
              See recent notes
            </Button>
            <Button
              icon={'plus'}
              minimal
              onClick={() => {
                dataInterface
                  .createDataItem({
                    name: 'New Draft',
                    tags: [InternalTag.Draft],
                    kind: DataItemKind.NoteItem,
                    childIds: [],
                    lastChange: new Date().getTime(),
                    created: new Date().getTime(),
                    noteType: 'atlaskit-editor-note',
                  } as any)
                  .then(item => mainContent.newTab(item));
              }}
            >
              New draft
            </Button>
          </>
        }
      />
    );
  }
};
