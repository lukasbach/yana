import * as React from 'react';
import { WorkSpaceSelection } from './WorkSpaceSelection';
import { SideBarTree } from './SideBarTree';
import { Button } from '@blueprintjs/core';
import { useDataInterface, useRefreshedSearch } from '../../datasource/DataInterface';
import { DataItemKind } from '../../types';
import { useEffect } from 'react';

export const SideBarContent: React.FC<{}> = props => {
  const dataInterface = useDataInterface();
  const rootCollections = useRefreshedSearch({ exactParents: [] });
  console.log("RELOAD SIDEBARCONTENT")
  useEffect(() => console.log("RELOAD ROOT COLLCTIONS"), [rootCollections])

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
        childIds: [],
        created: new Date().getTime(),
        lastChange: new Date().getTime()
      })}>
        New Collection
      </Button>
    </>
  );
};
