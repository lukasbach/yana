import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useAppData } from '../appdata/AppDataProvider';
import { DataInterface } from './DataInterface';
import { useAsyncEffect } from '../utils';
import { EditorRegistry } from '../editors/EditorRegistry';
import { useDevTools } from '../components/devtools/DevToolsContextProvider';
import { useCloseEvent } from '../common/useCloseEvent';
import { DataSourceRegistry } from './DataSourceRegistry';
import { useTelemetry } from '../components/telemetry/TelemetryProvider';
import { Alerter } from '../components/Alerter';
import { DataInterfaceContextError } from './DataInterfaceContextError';

export const useDataInterface = () => useContext(DataInterfaceContext);
export const DataInterfaceContext = React.createContext<DataInterface>(null as any);
export const DataInterfaceProvider: React.FC = props => {
  const appData = useAppData();
  const devtools = useDevTools();
  const telemetry = useTelemetry();
  const [dataInterface, setDataInterface] = useState<DataInterface | null>(null);
  const [error, setError] = useState<string>();

  useAsyncEffect(async () => {
    if (appData.currentWorkspace) {
      if (dataInterface?.dataSource) {
        await dataInterface.dataSource.unload();
      }

      const di = new DataInterface(
        DataSourceRegistry.getDataSource(appData.currentWorkspace, telemetry),
        EditorRegistry.Instance,
        undefined,
        devtools
      );

      try {
        await di.load();
        setDataInterface(di);
      } catch (e) {
        setError(e.message);
      }
    }
  }, [appData.currentWorkspace]);

  useEffect(() => {
    dataInterface?.reload();
  }, [appData.lastAutoBackup]);

  useCloseEvent(async () => {
    if (dataInterface) {
      await dataInterface.persist();
      await dataInterface.unload();
    }
  }, [dataInterface]);

  useEffect(
    () => () => {
      dataInterface?.unload();
    },
    [dataInterface]
  );

  if (error) {
    return <DataInterfaceContextError message={error} />;
  }

  return (
    <DataInterfaceContext.Provider value={dataInterface!}>
      {dataInterface && props.children}
    </DataInterfaceContext.Provider>
  );
};
