import * as React from 'react';
import { useContext, useState } from 'react';
import { AppData, WorkSpace } from '../types';
import { remote } from 'electron';
import path from 'path';
import { useAsyncEffect } from '../utils';
import * as fsLib from 'fs';
import { LocalFileSystemDataSource } from '../datasource/LocalFileSystemDataSource';
import { initializeWorkspace } from './initializeWorkspace';
import rimraf from 'rimraf';
import { Alerter } from '../components/Alerter';

const fs = fsLib.promises;

const userDataFolder = path.join(remote.app.getPath('appData'), 'yana');
const appDataFile = path.join(userDataFolder, 'workspaces.json');

console.log('AppDataFile located at', appDataFile);

export interface AppDataContextValue extends AppData {
  createWorkSpace: (name: string, path: string) => Promise<void>;
  setWorkSpace: (workspace: WorkSpace) => void;
  currentWorkspace: WorkSpace;
  deleteWorkspace(workspace: WorkSpace): void;
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
          const workspace = await initializeWorkspace(name, path);

          const newAppData: AppData = {
            ...appData,
            workspaces: [
              ...appData.workspaces,
              workspace,
            ],
          };

          fsLib.writeFileSync(appDataFile, JSON.stringify(newAppData));
          setAppData(newAppData);
        },
        deleteWorkspace(workspace: WorkSpace) {
          rimraf(workspace.dataSourceOptions.sourcePath, error => {
            if (error) {
              Alerter.Instance.alert({ content: 'Error: ' + error.message });
            }

            const newAppData: AppData = {
              ...appData,
              workspaces: appData.workspaces.filter(w => w.name !== workspace.name),
            };

            fsLib.writeFileSync(appDataFile, JSON.stringify(newAppData));
            setAppData(newAppData);
          });
        },
      }}
    >
      <div key={currentWorkspace?.dataSourceOptions?.sourcePath || '__'} style={{ height: '100%' }}>
        {props.children}
      </div>
    </AppDataContext.Provider>
  );
};
