import { useDataInterface } from './DataInterfaceContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAsyncEffect } from '../utils';
import { useCloseEvent } from '../common/useCloseEvent';

export const useStoredStucture = <T = any>(
  structureId: string,
  onLoad: (value: T) => any,
  defaultValue: T,
  persistDelay = 10000
) => {
  const [currentStructureId, setCurrentStructureId] = useState(structureId);
  const [value, setValue] = useState(defaultValue);
  const currentValue = useRef(defaultValue);
  const [hasLoaded, setHasLoaded] = useState(false);
  const persistTimer = useRef<any>(null);
  const dataInterface = useDataInterface();

  useEffect(() => {
    currentValue.current = value;
  }, [value]);

  const persist = useCallback(async () => {
    await dataInterface.storeStructure(currentStructureId, currentValue.current);
  }, [currentStructureId, value, hasLoaded]);

  useAsyncEffect(async () => {
    if (hasLoaded) {
      if (persistTimer.current) {
        clearTimeout(persistTimer.current);
      }
      await persist();
      setHasLoaded(false);
      setCurrentStructureId(structureId);
    }

    const currentValue = await dataInterface.getStructure<T>(structureId);
    onLoad(currentValue !== undefined ? currentValue : defaultValue);
    setValue(currentValue !== undefined ? currentValue : defaultValue);
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
    };
  }, []);

  useCloseEvent(persist, [structureId, value]);

  return [value, setValue] as const;
};
