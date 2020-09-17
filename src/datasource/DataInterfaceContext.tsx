import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useAppData } from '../appdata/AppDataProvider';
import { LocalFileSystemDataSource } from './LocalFileSystemDataSource';
import { DataInterface } from './DataInterface';

export const useDataInterface = () => useContext(DataInterfaceContext);
export const DataInterfaceContext = React.createContext<DataInterface>(null as any);
export const DataInterfaceProvider: React.FC = props => {
  const appData = useAppData();
  const [dataInterface, setDataInterface] = useState<DataInterface | null>(null);

  useEffect(() => {
    if (appData.currentWorkspace) {
      const di = new DataInterface(new LocalFileSystemDataSource(appData.currentWorkspace.dataSourceOptions));
      di.load().then(() => setDataInterface(di));
    }
  }, [appData.currentWorkspace]);

  return (
    <DataInterfaceContext.Provider value={ dataInterface! }>
      { dataInterface && props.children }
    </DataInterfaceContext.Provider>
  );
};