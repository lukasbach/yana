import * as React from 'react';
import { WorkSpaceSelection } from './WorkSpaceSelection';
import { SideBarTree } from './SideBarTree';
import { Button } from '@blueprintjs/core';
import { DataItemKind } from '../../types';
import { useEffect } from 'react';
import { useDataSearch } from '../../datasource/useDataSearch';
import { useDataInterface } from '../../datasource/DataInterfaceContext';

export const SideBarContent: React.FC<{}> = props => {
  const dataInterface = useDataInterface();
  const rootCollections = useDataSearch({ exactParents: [] });

  useEffect(() => console.log(`Changed root collections`, rootCollections), [rootCollections])

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
