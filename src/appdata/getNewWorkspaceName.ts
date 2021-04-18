import { AppDataContextValue } from './AppDataProvider';

export const getNewWorkspaceName = (appData: AppDataContextValue) => {
  let name = 'My thoughts';
  let counter = 2;
  const eq = (a: string, b: string) => a.toLowerCase().replace(/\s/g, '') === b.toLowerCase().replace(/\s/g, '');

  if (!appData.workspaces.find(ws => eq(ws.name, name))) {
    return name;
  }

  while (!!appData.workspaces.find(ws => eq(ws.name, `${name} ${counter}`))) {
    counter++;
  }

  return `${name} ${counter}`;
};
