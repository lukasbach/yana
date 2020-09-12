import * as React from 'react';
import { useContext, useState } from 'react';
import { AppData } from '../types';
import { app } from "electron";
import path from "path";
import { useAsyncEffect } from '../utils';
import * as fsLib from 'fs';
import { LocalFileSystemDataSource } from '../datasource/LocalFileSystemDataSource';

const fs = fsLib.promises;

const userDataFolder = app.getPath('userData');
const appDataFile = path.join(userDataFolder, 'workspaces.json');

interface AppDataContextValue extends AppData {
    createWorkSpace: (name: string, path: string) => Promise<void>;
}

export const AppDataContext = React.createContext<AppDataContextValue>(null as any);

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider: React.FC = props => {
    const [appData, setAppData] = useState<AppData>({ workspaces: [] });

    useAsyncEffect(async () => {
        if (!fsLib.existsSync(userDataFolder)) {
            await fs.mkdir(userDataFolder);
        }

        let appData: AppData = {
            workspaces: []
        };

        if (!fsLib.existsSync(appDataFile)) {
            await fs.writeFile(appDataFile, JSON.stringify(appData));
        } else {
            appData = JSON.parse(await fs.readFile(appDataFile, { encoding: 'utf8' }));
        }

        setAppData(appData);
    }, [])

    return (
        <AppDataContext.Provider value={{
            ...appData,
            createWorkSpace: async (name, path) => {
                const newAppData: AppData = {
                    ...appData,
                    workspaces: [
                        ...appData.workspaces,
                        {
                            name,
                            dataSourceType: 'fs',
                            dataSourceOptions: {
                                sourcePath: path
                            }
                        }
                    ]
                }

                await LocalFileSystemDataSource.init({ sourcePath: path });
                await fs.writeFile(appDataFile, JSON.stringify(newAppData));
                setAppData(newAppData);
            }
        }}>
            { props.children }
        </AppDataContext.Provider>
    );
};
