import { useDataInterface } from './DataInterfaceContext';
import { useEffect, useState } from 'react';

export const useDataItemContent = <C extends object>(dataItemId?: string) => {
  const dataInterface = useDataInterface();
  const [content, setContent] = useState<C | undefined>();

  useEffect(() => {
    if (dataItemId) {
      dataInterface.getNoteItemContent(dataItemId).then(setContent as any);
    }
  }, [dataItemId]);

  return content;
};
