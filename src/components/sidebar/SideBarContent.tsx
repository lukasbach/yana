import * as React from 'react';
import { WorkSpaceSelection } from './WorkSpaceSelection';
import { SideBarTree } from './SideBarTree';
import { Button } from '@blueprintjs/core';
import { useDataInterface, useRefreshedSearch } from '../../datasource/DataInterface';
import { DataItemKind } from '../../types';

export const SideBarContent: React.FC<{}> = props => {
  const dataInterface = useDataInterface();
  const rootCollections = useRefreshedSearch({ exactParents: [] });

  return (
    <>
      <WorkSpaceSelection />
      <SideBarTree
        rootItems={rootCollections}
      />
      <Button onClick={() => dataInterface.createDataItem({
        kind: DataItemKind.Collection,
        name: 'New Collection',
        tags: [],
        parentIds: [],
        created: new Date().getTime(),
        lastChange: new Date().getTime()
      })}>
        New Collection
      </Button>
    </>
  );
};
