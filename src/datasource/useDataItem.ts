import { DataItem } from '../types';
import { useState } from 'react';
import { useDataItems } from './useDataItems';
import { useAsyncEffect } from '../utils';
import { useDataInterface } from './DataInterfaceContext';

export const useDataItem = (id?: string): DataItem | undefined => {
  const [initialItem, setInitialItem] = useState<[DataItem] | undefined>();
  const [[refreshedItem]] = useDataItems(initialItem || []);
  const dataInterface = useDataInterface();

  useAsyncEffect(async () => {
    if (id) {
      setInitialItem([await dataInterface.getDataItem(id)]);
    }
  }, [id]);

  return refreshedItem;
};
