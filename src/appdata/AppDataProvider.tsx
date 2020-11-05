import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { AppData, WorkSpace } from '../types';
import { remote, webFrame } from 'electron';
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
import { CreateWorkspaceWindow } from '../components/appdata/CreateWorkspaceWindow';
import { appDataFile, userDataFolder } from './paths';

const fs = fsLib.promises;

export interface AppDataContextValue extends AppData {
  createWorkSpace: (name: string, path: string) => Promise<void>;
  addWorkSpace: (name: string, path: string) => Promise<void>;
  setWorkSpace: (workspace: WorkSpace) => void;
  currentWorkspace: WorkSpace;
  deleteWorkspace: (workspace: WorkSpace, deleteData?: boolean) => Promise<void>;
  saveSettings(settings: SettingsObject): Promise<void>;
  lastAutoBackup: number;
  openWorkspaceCreationWindow: () => void;
}

export const AppDataContext = React.createContext<AppDataContextValue>(null as any);

export const useAppData = () => useContext(AppDataContext);
export const useSettings = () => useAppData().settings;

export const AppDataProvider: React.FC = props => {
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [appData, setAppData] = useState<AppData>({ workspaces: [], settings: defaultSettings });
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkSpace>(appData.workspaces[0]);
  const [autoBackup, setAutoBackup] = useState<undefined | AutoBackupService>();
  const [lastAutoBackup, setLastAutoBackup] = useState(0);

  const isInInitialCreationScreen = !appData.workspaces[0];

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

    webFrame.setZoomFactor(appData.settings.zoomFactor);
  }, []);

  const ctx: AppDataContextValue = {
    ...appData,
    lastAutoBackup,
    currentWorkspace: currentWorkspace,
    setWorkSpace: setCurrentWorkspace,
    openWorkspaceCreationWindow: () => setIsCreatingWorkspace(true),
    addWorkSpace: async (name, path) => {
      const workspace: WorkSpace = {
        name,
        dataSourceType: 'fs',
        dataSourceOptions: {
          sourcePath: path
        }
      };

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
      setCurrentWorkspace(workspace);
    },
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
      setCurrentWorkspace(workspace);
    },
    deleteWorkspace: async (workspace, deleteData) => {
      if (deleteData) {
        await new Promise((res, rev) => {
          rimraf(workspace.dataSourceOptions.sourcePath, error => {
            if (error) {
              Alerter.Instance.alert({ content: 'Error: ' + error.message });
            } else {
              res();
            }
          });
        })
      }

      const newAppData: AppData = {
        ...appData,
        workspaces: appData.workspaces.filter(w => w.name !== workspace.name),
      };

      fsLib.writeFileSync(appDataFile, JSON.stringify(newAppData));
      setAppData(newAppData);
      autoBackup?.removeWorkspace(workspace);
      setCurrentWorkspace(newAppData.workspaces[0]);
    },
    saveSettings: async (settings: Partial<SettingsObject>) => {
      const newAppData: AppData = {
        ...appData,
        settings: { ...defaultSettings, ...appData.settings, ...settings }
      };

      fsLib.writeFileSync(appDataFile, JSON.stringify(newAppData));
      setAppData(newAppData);
      webFrame.setZoomFactor(newAppData.settings.zoomFactor);
    },
  };

  return (
    <AppDataContext.Provider value={ctx}>
      <div key={currentWorkspace?.dataSourceOptions?.sourcePath || '__'} style={{ height: '100%' }}>
        { isCreatingWorkspace || isInInitialCreationScreen ? (
          <CreateWorkspaceWindow
            onClose={() => isInInitialCreationScreen ? remote.getCurrentWindow().close() : setIsCreatingWorkspace(false)}
            onCreate={(name, wsPath) => {
              ctx.createWorkSpace(name, wsPath);
              setIsCreatingWorkspace(false);
            }}
            onImported={() => {
              setCurrentWorkspace(appData.workspaces[0]);
            }}
          />
        ) : props.children }
      </div>
    </AppDataContext.Provider>
  );
};
