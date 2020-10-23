import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useAppData } from '../appdata/AppDataProvider';
import { LocalFileSystemDataSource } from './LocalFileSystemDataSource';
import { DataInterface } from './DataInterface';
import { useAsyncEffect } from '../utils';

export const useDataInterface = () => useContext(DataInterfaceContext);
export const DataInterfaceContext = React.createContext<DataInterface>(null as any);
export const DataInterfaceProvider: React.FC = props => {
  const appData = useAppData();
  const [dataInterface, setDataInterface] = useState<DataInterface | null>(null);

  useAsyncEffect(async () => {
    if (appData.currentWorkspace) {
      if (dataInterface?.dataSource) {
        await dataInterface.dataSource.unload();
      }

      const di = new DataInterface(new LocalFileSystemDataSource(appData.currentWorkspace.dataSourceOptions));
      await di.load();
      setDataInterface(di);
    }
  }, [appData.currentWorkspace]);

  return (
    <DataInterfaceContext.Provider value={ dataInterface! }>
      { dataInterface && props.children }
    </DataInterfaceContext.Provider>
  );
};