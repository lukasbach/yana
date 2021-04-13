import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { AppData, DataSourceType, WorkSpace } from '../types';
import { remote, webFrame } from 'electron';
import path from 'path';
import { getElectronPath, useAsyncEffect } from '../utils';
import * as fsLib from 'fs';
import { initializeWorkspace } from './initializeWorkspace';
import rimraf from 'rimraf';
import { Alerter } from '../components/Alerter';
import { defaultSettings } from '../settings/defaultSettings';
import { SettingsObject } from '../settings/types';
import { AutoBackupService } from './AutoBackupService';
import { CreateWorkspaceWindow } from '../components/appdata/CreateWorkspaceWindow';
import { appDataFile, userDataFolder } from './paths';
import { getNewWorkspaceName } from './getNewWorkspaceName';
import { LogService } from '../common/LogService';
import { v4 as uuid } from 'uuid';
import { TelemetryService } from '../components/telemetry/TelemetryProvider';
import { TelemetryEvents } from '../components/telemetry/TelemetryEvents';

const fs = fsLib.promises;

export interface AppDataContextValue extends AppData {
  createWorkSpace: (name: string, path: string, dataSourceType: DataSourceType, empty?: boolean) => Promise<WorkSpace>;
  addWorkSpace: (name: string, path: string) => Promise<void>;
  setWorkSpace: (workspace: WorkSpace) => void;
  currentWorkspace: WorkSpace;
  deleteWorkspace: (workspace: WorkSpace, deleteData?: boolean) => Promise<void>;
  saveSettings(settings: SettingsObject): Promise<void>;
  lastAutoBackup: number;
  openWorkspaceCreationWindow: () => void;
  telemetryId: string;
  moveWorkspace: (workspace: WorkSpace, direction: 'up' | 'down') => Promise<void>;
  renameWorkspace: (workspace: WorkSpace, newName: string) => Promise<void>;
}

export const AppDataContext = React.createContext<AppDataContextValue>(null as any);
export const useAppData = () => useContext(AppDataContext);
export const useSettings = () => useAppData().settings;

function moveItem<T>(array: T[], from: number, to: number) {
  const arrayClone = [...array];
  const f = arrayClone.splice(from, 1)[0];
  arrayClone.splice(to, 0, f);
  return arrayClone;
}

// TODO redo AppDataService and encapsulate load/save calls in there, really redundant in this file!
export const AppDataProvider: React.FC = props => {
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [appData, setAppData] = useState<AppData>({ workspaces: [], settings: defaultSettings, telemetryId: '_' });
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkSpace>(appData.workspaces[0]);
  const [autoBackup, setAutoBackup] = useState<undefined | AutoBackupService>();
  const [lastAutoBackup, setLastAutoBackup] = useState(0);

  const isInInitialCreationScreen = !appData.workspaces[0];

  useAsyncEffect(async () => {
    if (!fsLib.existsSync(userDataFolder)) {
      await fs.mkdir(userDataFolder);
    }

    let appData: AppData = {
      workspaces: [],
      settings: defaultSettings,
      telemetryId: uuid(),
    };

    if (!fsLib.existsSync(appDataFile)) {
      await fs.writeFile(appDataFile, JSON.stringify(appData));
    } else {
      appData = {
        ...appData,
        ...JSON.parse(await fs.readFile(appDataFile, { encoding: 'utf8' }))
      };
    }

    appData.settings = { ...defaultSettings, ...appData.settings };

    setAppData(appData);
    setCurrentWorkspace(appData.workspaces[0]);

    const autoBackupService = new AutoBackupService(appData.workspaces, appData.settings, setLastAutoBackup);
    await autoBackupService.load();
    setAutoBackup(autoBackupService);

    webFrame.setZoomFactor(appData.settings.zoomFactor);
    LogService.applySettings(appData.settings);
  }, []);

  const ctx: AppDataContextValue = {
    ...appData,
    lastAutoBackup,
    currentWorkspace: currentWorkspace,
    setWorkSpace: ws => {
      setCurrentWorkspace(ws);
      TelemetryService?.trackEvent(...TelemetryEvents.Workspaces.switch);
    },
    openWorkspaceCreationWindow: () => setIsCreatingWorkspace(true),
    addWorkSpace: async (name, path) => {
      const workspace: WorkSpace = {
        name,
        dataSourceType: 'sqlite3', // TODO
        dataSourceOptions: {
          sourcePath: path
        }
      };

      if (appData.workspaces.find(w => w.name === name)) {
        throw Error(`A workspace with the name ${name} already exists.`);
      }

      const newAppData: AppData = {
        ...appData,
        workspaces: [
          ...appData.workspaces,
          workspace,
        ],
      };

      await fs.writeFile(appDataFile, JSON.stringify(newAppData));
      setAppData(newAppData);
      autoBackup?.addWorkspace(workspace);
      setCurrentWorkspace(workspace);
      TelemetryService?.trackEvent(...TelemetryEvents.Workspaces.addExisting);
    },
    createWorkSpace: async (name, path, dataSourceType, empty?: boolean) => {
      if (appData.workspaces.find(ws => ws.name === name)) {
        throw Error('A workspace with that name already exists.');
      }

      const workspace = await initializeWorkspace(name, path, dataSourceType, empty);

      const newAppData: AppData = {
        ...appData,
        workspaces: [
          ...appData.workspaces,
          workspace,
        ],
      };

      await fs.writeFile(appDataFile, JSON.stringify(newAppData));
      setAppData(newAppData);
      autoBackup?.addWorkspace(workspace);
      TelemetryService?.trackEvent(...TelemetryEvents.Workspaces.create);
      return workspace;
    },
    deleteWorkspace: async (workspace, deleteData) => {
      if (currentWorkspace.dataSourceOptions.sourcePath === workspace.dataSourceOptions.sourcePath) {
        return Alerter.Instance.alert({
          content: `Cannot delete the workspace that is currently opened. Please open a different workspace and retry deletion.`,
          intent: 'danger',
          canEscapeKeyCancel: true,
          canOutsideClickCancel: true,
          icon: 'warning-sign',
        });
      }

      if (deleteData) {
        await new Promise((res, rev) => {
          rimraf(workspace.dataSourceOptions.sourcePath, error => {
            if (error) {
              Alerter.Instance.alert({ content: 'Error: ' + error.message });
            } else {
              res();
            }
          });
        });
        TelemetryService?.trackEvent(...TelemetryEvents.Workspaces.deleteFromDisk);
      } else {
        TelemetryService?.trackEvent(...TelemetryEvents.Workspaces.deleteFromYana);
      }

      const newAppData: AppData = {
        ...appData,
        workspaces: appData.workspaces.filter(w => w.name !== workspace.name),
      };

      await fs.writeFile(appDataFile, JSON.stringify(newAppData));
      setAppData(newAppData);
      autoBackup?.removeWorkspace(workspace);
      setCurrentWorkspace(newAppData.workspaces[0]);
    },
    moveWorkspace: async (workspace, direction) => {
      const oldIndex = appData.workspaces.findIndex(w => w.name === workspace.name);

      if ((oldIndex === 0 && direction === 'up') || (oldIndex === appData.workspaces.length - 1 && direction === 'down')) {
        return;
      }

      const newAppData: AppData = {
        ...appData,
        workspaces: moveItem(appData.workspaces, oldIndex, direction === 'up' ? oldIndex - 1 : oldIndex + 1),
      };
      await fs.writeFile(appDataFile, JSON.stringify(newAppData));
      setAppData(newAppData);
    },
    renameWorkspace: async (workspace, newName) => {
      if (appData.workspaces.find(ws => ws.name === newName)) {
        throw Error('A workspace with that name already exists.');
      }

      const oldWorkspace = appData.workspaces.find(ws => ws.name === workspace.name);

      if (!oldWorkspace) {
        throw Error(`The old workspace ${workspace.name} was not found.`);
      }

      const newWorkspace = {
        ...oldWorkspace,
        name: newName,
      }

      const newAppData: AppData = {
        ...appData,
        workspaces: appData.workspaces.map(ws => ws.name === workspace.name ? newWorkspace : ws),
      };
      await fs.writeFile(appDataFile, JSON.stringify(newAppData));
      setAppData(newAppData);

      if (currentWorkspace.name === workspace.name) {
        ctx.setWorkSpace(newWorkspace);
      }
    },
    saveSettings: async (settings: Partial<SettingsObject>) => {
      const newAppData: AppData = {
        ...appData,
        settings: { ...defaultSettings, ...appData.settings, ...settings }
      };

      await fs.writeFile(appDataFile, JSON.stringify(newAppData));
      setAppData(newAppData);
      webFrame.setZoomFactor(newAppData.settings.zoomFactor);
    },
  };

  return (
    <AppDataContext.Provider value={ctx}>
      <div key={currentWorkspace?.dataSourceOptions?.sourcePath || '__'} style={{ height: '100%' }}>
        { isCreatingWorkspace || isInInitialCreationScreen ? (
          <CreateWorkspaceWindow
            isInitialCreationScreen={isInInitialCreationScreen}
            defaultWorkspaceName={getNewWorkspaceName(ctx)}
            onClose={() => isInInitialCreationScreen ? remote.getCurrentWindow().close() : setIsCreatingWorkspace(false)}
            onCreate={async (name, wsPath) => {
              try {
                const workspace = await ctx.createWorkSpace(name, wsPath, 'sqlite3'); // TODO
                setCurrentWorkspace(workspace);
                setIsCreatingWorkspace(false);
              } catch(e) {
                Alerter.Instance.alert({
                  content: `Error: ${e.message}`,
                  intent: 'danger',
                  canEscapeKeyCancel: true,
                  canOutsideClickCancel: true,
                  icon: 'warning-sign',
                });
              }
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
