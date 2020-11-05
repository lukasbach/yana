import { AppDataContextValue } from './AppDataProvider';
import { remote } from "electron";
import fs from "fs";
import path from "path";
import { Alerter } from '../components/Alerter';
import * as React from 'react';

export const runAddWorkspaceWizard = async (appDataContext: AppDataContextValue) => {
  const folderResult = await remote.dialog.showOpenDialog({
    buttonLabel: 'Load workspace',
    properties: ['openDirectory', 'createDirectory'],
    title: 'Choose the directory of a Yana workspace to add',
    message: 'Note that this directory must contain a notebook.json file',
  });

  if (folderResult.canceled || !folderResult.filePaths[0]) return;

  const folder = folderResult.filePaths[0];

  if (!(await fs.existsSync(path.join(folder, 'notebook.json')))) {
    Alerter.Instance.alert({
      confirmButtonText: 'Okay',
      content: <>The chosen directory is not a valid Yana workspace. It must contain a <code>notebook.json</code> file.</>,
      canOutsideClickCancel: true,
      canEscapeKeyCancel: true,
    });
    return;
  }

  const workspaceName: string = await new Promise(res => {
    Alerter.Instance.alert({
      confirmButtonText: 'Okay',
      cancelButtonText: 'Cancel',
      content: 'Choose a name for the workspace',
      canOutsideClickCancel: true,
      canEscapeKeyCancel: true,
      prompt: {
        type: 'string',
        onConfirmText: value => res(value)
      }
    });
  });

  await appDataContext.addWorkSpace(workspaceName, folder);
}