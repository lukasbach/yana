import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useAppData } from '../appdata/AppDataProvider';
import { LocalFileSystemDataSource } from './LocalFileSystemDataSource';
import { DataInterface } from './DataInterface';
import { useAsyncEffect } from '../utils';
import { EditorRegistry } from '../editors/EditorRegistry';
import { useDevTools } from '../components/devtools/DevToolsContextProvider';
import { useCloseEvent } from '../common/useCloseEvent';

export const useDataInterface = () => useContext(DataInterfaceContext);
export const DataInterfaceContext = React.createContext<DataInterface>(null as any);
export const DataInterfaceProvider: React.FC = props => {
  const appData = useAppData();
  const devtools = useDevTools();
  const [dataInterface, setDataInterface] = useState<DataInterface | null>(null);

  useAsyncEffect(async () => {
    if (appData.currentWorkspace) {
      if (dataInterface?.dataSource) {
        await dataInterface.dataSource.unload();
      }

      const di = new DataInterface(
        new LocalFileSystemDataSource(appData.currentWorkspace.dataSourceOptions),
        EditorRegistry.Instance,
        undefined,
        devtools
      );
      await di.load();
      setDataInterface(di);
    }
  }, [appData.currentWorkspace]);

  useEffect(() => {
    dataInterface?.reload();
  }, [appData.lastAutoBackup]);

  useCloseEvent(async () => {
    if (dataInterface) {
      await dataInterface.persist();
    }
  }, [dataInterface])

  return (
    <DataInterfaceContext.Provider value={ dataInterface! }>
      { dataInterface && props.children }
    </DataInterfaceContext.Provider>
  );
};