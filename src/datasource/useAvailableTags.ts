import { useState } from 'react';
import { useAsyncEffect } from '../utils';
import { useDataInterface } from './DataInterfaceContext';

export const useAvailableTags = (includeInternalTags?: boolean, dependencies?: any[]) => {
  const dataInterface = useDataInterface();
  const [tags, setTags] = useState<Array<{ value: string }>>([]);

  useAsyncEffect(async () => {
    const t = await dataInterface.getAvailableTags();
    setTags(t);
  }, dependencies || []);

  return includeInternalTags ? tags : tags.filter(tag => !tag.value.startsWith('__'));
};
