import { DataItem } from '../types';
import { useRef, useState } from 'react';
import { isMediaItem, isNoteItem, useAsyncEffect } from '../utils';
import { useDataInterface } from './DataInterfaceContext';
import { LogService } from '../common/LogService';

const logger = LogService.getLogger('useDataItemPreviews');

export const useDataItemPreviews = (items: DataItem[]) => {
  const dataInterface = useDataInterface();
  const [previews, setPreviews] = useState<{ [itemId: string]: object | string }>({});
  const loadedPreviewIds = useRef<string[]>([]);

  useAsyncEffect(async () => {
    logger.log('New items');
    for (const item of items) {
      if (!loadedPreviewIds.current.includes(item.id)) {
        loadedPreviewIds.current.push(item.id);
        if (isNoteItem(item)) {
          const content = await dataInterface.getNoteItemContent(item.id);
          setPreviews(old => ({ ...old, [item.id]: content }));
        } else if (isMediaItem(item) && item.hasThumbnail) {
          const thumb = await dataInterface.loadMediaItemContentThumbnailAsPath(item.id);
          if (thumb) {
            setPreviews(old => ({ ...old, [item.id]: thumb }));
          }
        }
      }
    }
  }, [items]);

  return previews;
};
