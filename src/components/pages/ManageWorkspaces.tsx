import * as React from 'react';
import { PageContainer } from '../common/PageContainer';
import { PageHeader } from '../common/PageHeader';
import { Button, Tooltip } from '@blueprintjs/core';
import { DetailedListContainer } from '../common/DetailedListContainer';
import { DetailedListItem } from '../common/DetailedListItem';
import { CreateWorkspaceDialog } from '../appdata/CreateWorkspaceDialog';
import { useState } from 'react';
import { useAppData } from '../../appdata/AppDataProvider';
import { remote } from "electron";
import { AppDataExportService } from '../../appdata/AppDataExportService';
import { Alerter } from '../Alerter';

export const ManageWorkspaces: React.FC<{}> = props => {
  const appData = useAppData();
  const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false);

  return (
    <PageContainer header={(
      <PageHeader
        title="Manage workspaces"
        icon="cog"
        rightContent={(
          <>
            <Button outlined onClick={async () => {
              const zipResult = await remote.dialog.showOpenDialog({
                buttonLabel: 'Import',
                properties: [],
                title: 'Choose a exported workspace',
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
                    onConfirmText: value => res(value)
                  }
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
                  content: <>Do you want to import the workspace into the folder
                    <pre>{ destResult.filePaths[0] }</pre>? The files will be spread
                    directly into this folder. You cannot change this later!</>,
                  canOutsideClickCancel: true,
                  canEscapeKeyCancel: true,
                  onConfirm: () => res(true),
                  onCancel: () => res(false),
                });
              });

              if (!confirmed) return;

              await AppDataExportService.import(
                zipResult.filePaths[0],
                workspaceName,
                destResult.filePaths[0],
                appData,
                console.log
              );
            }}>
              Import workspace
            </Button>
            {' '}
            <Button intent="primary" onClick={() => setIsCreationDialogOpen(true)} outlined>
              Create new workspace
            </Button>
          </>
        )}
      />
    )}>
      <CreateWorkspaceDialog isOpen={isCreationDialogOpen} onSetIsOpen={setIsCreationDialogOpen} />
      <DetailedListContainer>
        {
          appData.workspaces.map(workspace => (
            <DetailedListItem
              key={workspace.dataSourceOptions.sourcePath}
              title={workspace.name}
              subtitle={workspace.dataSourceOptions.sourcePath}
              icon={'database'}
              actionButtons={(
                <>
                  <Tooltip content="Switch to workspace" position={'bottom'}>
                    <Button
                      outlined
                      icon={'chevron-right'}
                      onClick={() => appData.setWorkSpace(workspace)}
                    />
                  </Tooltip>
                  <Tooltip content="Export workspace to file" position={'bottom'}>
                    <Button
                      outlined
                      icon={'export'}
                      onClick={async () => {
                        const result = await remote.dialog.showSaveDialog({
                          buttonLabel: 'Export',
                          properties: ['createDirectory', 'showOverwriteConfirmation'],
                          title: 'Choose a location to export your workspace to',
                          defaultPath: workspace.name.toLowerCase().replace(/\s/g, '_') + '.zip',
                        });
                        if (result.filePath) {
                          await AppDataExportService.exportTo(result.filePath, workspace, console.log)
                          remote.shell.showItemInFolder(result.filePath);
                        }
                      }}
                    />
                  </Tooltip>
                  <Tooltip content="Delete workspace" position={'bottom'}>
                    <Button
                      outlined
                      intent="danger"
                      icon={'trash'}
                      onClick={async () => {
                        const securityCheckPassed: boolean = await new Promise(res => {
                          const supposedInput = workspace.name.toLowerCase().replace(/\s/g, '');

                          Alerter.Instance.alert({
                            confirmButtonText: 'Okay',
                            cancelButtonText: 'Cancel',
                            intent: 'danger',
                            icon: 'warning-sign',
                            content: <>
                              <p><b>Warning</b>: This is a destructive operation! The workspace will be deleted and cannot
                                be restored.</p>
                              <p>To continue, type the following text in the input below: <b>{supposedInput}</b></p>
                            </>,
                            canOutsideClickCancel: true,
                            canEscapeKeyCancel: true,
                            prompt: {
                              type: 'string',
                              onConfirmText: value => {
                                res(value === supposedInput)
                              }
                            }
                          });
                        });

                        if (securityCheckPassed) {
                          appData.deleteWorkspace(workspace);
                        } else {
                          Alerter.Instance.alert({ content: 'The workspace name you wrote was incorrect.' });
                        }
                      }}
                    />
                  </Tooltip>
                </>
              )}
            />
          ))
        }
      </DetailedListContainer>
    </PageContainer>
  );
};
