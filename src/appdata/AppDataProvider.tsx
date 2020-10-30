import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { AppData, WorkSpace } from '../types';
import { remote } from 'electron';
import path from 'path';
import { getElectronPath, useAsyncEffect } from '../utils';
import * as fsLib from 'fs';
import { LocalFileSystemDataSource } from '../datasource/LocalFileSystemDataSource';
import { initializeWorkspace } from './initializeWorkspace';
import rimraf from 'rimraf';
import { Alerter } from '../components/Alerter';
import { defaultSettings } from '../settings/defaultSettings';
import { SettingsObject } from '../settings/types';
import { AutoBackupService } from './AutoBackupService';

const fs = fsLib.promises;

export const userDataFolder = path.join(getElectronPath('appData'), 'yana');
export const appDataFile = path.join(userDataFolder, 'workspaces.json');

console.log('AppDataFile located at', appDataFile);

export interface AppDataContextValue extends AppData {
  createWorkSpace: (name: string, path: string) => Promise<void>;
  setWorkSpace: (workspace: WorkSpace) => void;
  currentWorkspace: WorkSpace;
  deleteWorkspace(workspace: WorkSpace): void;
  saveSettings(settings: SettingsObject): Promise<void>;
  lastAutoBackup: number;
}

export const AppDataContext = React.createContext<AppDataContextValue>(null as any);

export const useAppData = () => useContext(AppDataContext);
export const useSettings = () => useAppData().settings;

export const AppDataProvider: React.FC = props => {
  const [appData, setAppData] = useState<AppData>({ workspaces: [], settings: defaultSettings });
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkSpace>(appData.workspaces[0]);
  const [autoBackup, setAutoBackup] = useState<undefined | AutoBackupService>();
  const [lastAutoBackup, setLastAutoBackup] = useState(0);

  useAsyncEffect(async () => {
    if (!fsLib.existsSync(userDataFolder)) {
      fsLib.mkdirSync(userDataFolder);
    }

    let appData: AppData = {
      workspaces: [],
      settings: defaultSettings
    };

    if (!fsLib.existsSync(appDataFile)) {
      fsLib.writeFileSync(appDataFile, JSON.stringify(appData));
    } else {
      appData = JSON.parse(fsLib.readFileSync(appDataFile, { encoding: 'utf8' }));
    }

    appData.settings = { ...defaultSettings, ...appData.settings };

    setAppData(appData);
    setCurrentWorkspace(appData.workspaces[0]);

    const autoBackupService = new AutoBackupService(appData.workspaces, appData.settings, setLastAutoBackup);
    await autoBackupService.load();
    setAutoBackup(autoBackupService);
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        ...appData,
        currentWorkspace: currentWorkspace,
        setWorkSpace: setCurrentWorkspace,
        lastAutoBackup,
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
          autoBackup?.addWorkspace(workspace);
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
            autoBackup?.removeWorkspace(workspace);
          });
        },
        saveSettings: async (settings: Partial<SettingsObject>) => {
          const newAppData: AppData = {
            ...appData,
            settings: { ...defaultSettings, ...appData.settings, ...settings }
          };

          fsLib.writeFileSync(appDataFile, JSON.stringify(newAppData));
          setAppData(newAppData);
        },
      }}
    >
      <div key={currentWorkspace?.dataSourceOptions?.sourcePath || '__'} style={{ height: '100%' }}>
        {props.children}
      </div>
    </AppDataContext.Provider>
  );
};
