import { useDataInterface } from './DataInterfaceContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAsyncEffect } from '../utils';
import { useCloseEvent } from '../common/useCloseEvent';

export const useStoredStucture = <T = any>(
  structureId: string,
  onLoad: (value: T) => any,
  defaultValue: T,
  persistDelay = 10000,
) => {
  const [value, setValue] = useState(defaultValue);
  const [hasLoaded, setHasLoaded] = useState(false);
  const persistTimer = useRef<any>(null);
  const dataInterface = useDataInterface();

  const persist = useCallback(async () => {
    await dataInterface.storeStructure(structureId, value);
  }, [structureId, value, hasLoaded]);

  useAsyncEffect(async () => {
    const currentValue = await dataInterface.getStructure<T>(structureId);
    onLoad(currentValue ?? defaultValue);
    setValue(currentValue);
    setHasLoaded(true);
  }, [structureId]);

  useEffect(() => {
    if (!hasLoaded) return;
    if (persistTimer.current) {
      clearTimeout(persistTimer.current);
    }
    persistTimer.current = setTimeout(persist, persistDelay);
  }, [value]);

  useEffect(() => {
    return () => {
      if (persistTimer.current) {
        clearTimeout(persistTimer.current);
      }
      persist();
    }
  }, [structureId]);

  useCloseEvent(persist, [structureId, value]);

  return [value, setValue] as const;
}