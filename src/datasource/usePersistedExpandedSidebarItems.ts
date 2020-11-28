import { useCallback, useEffect, useState } from 'react';
import { useDataInterface } from './DataInterfaceContext';
import { useAsyncEffect } from '../utils';
import { useCloseEvent } from '../common/useCloseEvent';
import { LogService } from '../common/LogService';
import { useStoredStucture } from './useStoredStructure';

const logger = LogService.getLogger('usePersistedExpandedSidebarItems');

export const usePersistedExpandedSidebarItems = (
  storageId: string,
  expand: (id: string) => Promise<void>,
  expandedIds: string[],
) => {
  const structureId = 'sessionSidebar_' + storageId;
  const [ignored, setStoredValue] = useStoredStucture<string[]>(
    structureId,
    async (folders) => {
      logger.log("Loading", [], {folders, expandedIds});
      if (folders) {
        for (const folder of folders) {
          if (!(folder in expandedIds)) {
            await expand(folder);
          }
        }
      }
    },
    []
  );

  useEffect(() => {
    logger.log(`Persisting to ${structureId}: ${expandedIds.join(', ')}`, [], {storageId, expandedIds});
    setStoredValue(expandedIds);
  }, [expandedIds]);
};