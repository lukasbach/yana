import { AppDataContextValue } from './AppDataProvider';
import * as remote from '@electron/remote';
import { Alerter } from '../components/Alerter';
import * as React from 'react';
import { runImport } from './runImport';

export const runImportWizard = async (appDataContext: AppDataContextValue) => {
  const zipResult = await remote.dialog.showOpenDialog({
    buttonLabel: 'Import',
    properties: [],
    title: 'Choose a exported workspace',
    filters: [{ name: 'Exported workspace', extensions: ['zip'] }],
  });

  if (zipResult.canceled || !zipResult.filePaths[0]) return;

  const workspaceName: string | undefined = await new Promise(res => {
    Alerter.Instance.alert({
      confirmButtonText: 'Okay',
      cancelButtonText: 'Cancel',
      content: 'Choose a name for the imported workspace',
      canOutsideClickCancel: true,
      canEscapeKeyCancel: true,
      prompt: {
        type: 'string',
        onConfirmText: value => res(value),
      },
    });
  });

  if (!workspaceName) return;

  const destResult = await remote.dialog.showOpenDialog({
    buttonLabel: 'Set',
    properties: ['createDirectory', 'openDirectory'],
    title: 'Choose a location where to store the workspace at',
  });

  if (destResult.canceled || !destResult.filePaths[0]) return;

  const confirmed: boolean = await new Promise(res => {
    Alerter.Instance.alert({
      confirmButtonText: 'Okay',
      cancelButtonText: 'Cancel',
      content: (
        <>
          Do you want to import the workspace into the folder
          <pre>{destResult.filePaths[0]}</pre>? The files will be spread directly into this folder. You cannot change
          this later!
        </>
      ),
      canOutsideClickCancel: true,
      canEscapeKeyCancel: true,
      onConfirm: () => res(true),
      onCancel: () => res(false),
    });
  });

  if (!confirmed) return;

  try {
    await runImport(zipResult.filePaths[0], workspaceName, destResult.filePaths[0], appDataContext, console.log);
  } catch (e) {
    Alerter.Instance.alert({
      confirmButtonText: 'Okay',
      content: 'Error: ' + e.message,
      canOutsideClickCancel: true,
      canEscapeKeyCancel: true,
    });
  }
};
