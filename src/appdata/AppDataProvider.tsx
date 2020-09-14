import * as React from 'react';
import { useContext, useState } from 'react';
import { AppData, WorkSpace } from '../types';
import { remote } from 'electron';
import path from 'path';
import { useAsyncEffect } from '../utils';
import * as fsLib from 'fs';
import { LocalFileSystemDataSource } from '../datasource/LocalFileSystemDataSource';

const fs = fsLib.promises;

const userDataFolder = path.join(remote.app.getPath('appData'), 'yana');
const appDataFile = path.join(userDataFolder, 'workspaces.json');

console.log('AppDataFile located at', appDataFile);

interface AppDataContextValue extends AppData {
  createWorkSpace: (name: string, path: string) => Promise<void>;
  setWorkSpace: (workspace: WorkSpace) => void;
  currentWorkspace: WorkSpace;
}

export const AppDataContext = React.createContext<AppDataContextValue>(null as any);

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider: React.FC = props => {
  const [appData, setAppData] = useState<AppData>({ workspaces: [] });
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkSpace>(appData.workspaces[0]);

  useAsyncEffect(async () => {
    if (!fsLib.existsSync(userDataFolder)) {
      fsLib.mkdirSync(userDataFolder);
    }

    let appData: AppData = {
      workspaces: [],
    };

    if (!fsLib.existsSync(appDataFile)) {
      fsLib.writeFileSync(appDataFile, JSON.stringify(appData));
    } else {
      appData = JSON.parse(fsLib.readFileSync(appDataFile, { encoding: 'utf8' }));
    }

    setAppData(appData);
    setCurrentWorkspace(appData.workspaces[0]);
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        ...appData,
        currentWorkspace: currentWorkspace,
        setWorkSpace: setCurrentWorkspace,
        createWorkSpace: async (name, path) => {
          const newAppData: AppData = {
            ...appData,
            workspaces: [
              ...appData.workspaces,
              {
                name,
                dataSourceType: 'fs',
                dataSourceOptions: {
                  sourcePath: path,
                },
              },
            ],
          };

          await LocalFileSystemDataSource.init({ sourcePath: path });
          fsLib.writeFileSync(appDataFile, JSON.stringify(newAppData));
          setAppData(newAppData);
        },
      }}
    >
      {props.children}
    </AppDataContext.Provider>
  );
};
