import * as React from 'react';
import { useDataItems } from '../../datasource/useDataItems';
import { useState } from 'react';
import { useAsyncEffect } from '../../utils';
import { SideBarTree } from './SideBarTree';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { DataItem } from '../../types';
import { LogService } from '../../common/LogService';

const logger = LogService.getLogger('SideBarTreeOnIds');

export const SideBarTreeOnIds: React.FC<{
  title: string;
  rootItems: string[];
  masterItem?: DataItem;
}> = props => {
  const dataInterface = useDataInterface();
  const [initialItems, setInitialItems] = useState<DataItem[]>([]);
  const [items] = useDataItems(initialItems);
  const [hasLoaded, setHasLoaded] = useState(false);

  useAsyncEffect(async () => {
    logger.log('loading', [], { rootitems: props.rootItems });
    setHasLoaded(false);
    const loadedItems: DataItem[] = [];
    for (const id of props.rootItems) {
      loadedItems.push(await dataInterface.getDataItem(id));
    }
    logger.log('found items: ', [], { loadedItems });
    setInitialItems(loadedItems);
    setHasLoaded(true);
  }, [props.rootItems]);

  return hasLoaded ? <SideBarTree title={props.title} rootItems={items} masterItem={props.masterItem} /> : null;
};
