import * as React from 'react';
import { useContext, useState } from 'react';
import { useSettings } from '../../appdata/AppDataProvider';

interface DevToolsContextGetters {
  counters: { [key: string]: number | undefined },
}

interface DevToolsContextSetters {
  increaseCounter: (key: string, count?: number) => void,
  resetAllCounters: () => void,
  setCounterValue: (key: string, count: number) => void,
  resetCounter: (key: string) => void,
}

export type DevtoolsContextType = DevToolsContextGetters & DevToolsContextSetters;

const DevToolsContext = React.createContext<DevtoolsContextType>(null as any);

export const useDevTools = () => useContext(DevToolsContext);

export const DevToolsContextProvider: React.FC<{}> = props => {
  const settings = useSettings();
  const [get, set] = useState<DevToolsContextGetters>({ counters: {} });

  if (!settings.devToolsOpen) {
    return <>{ props.children }</>;
  }

  return (
    <DevToolsContext.Provider value={{
      ...get,
      increaseCounter: (key, count) => set(v => ({
        ...v,
        counters: { ...v.counters, [key]: (count === undefined ? 1 : count) + (v.counters[key] || 0) }
      })),
      setCounterValue: (key, count) => set(v => ({
        ...v,
        counters: { ...v.counters, [key]: count }
      })),
      resetCounter: key => set(v => ({
        ...v,
        counters: { ...v.counters, [key]: undefined }
      })),
      resetAllCounters: () => set(v => ({ ...v, counters: {} })),
    }}>
      { props.children }
    </DevToolsContext.Provider>
  );
};
