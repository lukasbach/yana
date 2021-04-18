import { Alerter } from '../components/Alerter';
import * as React from 'react';
import { WorkSpace } from '../types';
import { AppDataContextValue } from './AppDataProvider';

export const runRemoveWorkspaceWizard = async (workspace: WorkSpace, appData: AppDataContextValue) => {
  const removeFromDisk: boolean = await new Promise(res =>
    Alerter.Instance.alert({
      confirmButtonText: 'Okay',
      cancelButtonText: 'Cancel',
      intent: 'danger',
      content: 'Do you want to delete all notebook data on disk?',
      canOutsideClickCancel: false,
      canEscapeKeyCancel: false,
      prompt: {
        type: 'boolean',
        text: 'Delete from disk',
        defaultValue: false,
        onConfirmBoolean: res,
      },
    })
  );

  if (!removeFromDisk) {
    await appData.deleteWorkspace(workspace, false);
    return;
  }

  const securityCheckPassed: boolean = await new Promise(res => {
    const supposedInput = workspace.name.toLowerCase().replace(/\s/g, '');

    Alerter.Instance.alert({
      confirmButtonText: 'Okay',
      cancelButtonText: 'Cancel',
      intent: 'danger',
      icon: 'warning-sign',
      content: (
        <>
          <p>
            <b>Warning</b>: This is a destructive operation! The workspace will be deleted and cannot be restored.
          </p>
          <p>
            To continue, type the following text in the input below: <b>{supposedInput}</b>
          </p>
        </>
      ),
      canOutsideClickCancel: false,
      canEscapeKeyCancel: false,
      prompt: {
        type: 'string',
        onConfirmText: value => {
          res(value === supposedInput);
        },
      },
    });
  });

  if (securityCheckPassed) {
    await appData.deleteWorkspace(workspace, true);
  } else {
    Alerter.Instance.alert({ content: 'The workspace name you wrote was incorrect.' });
  }
};
