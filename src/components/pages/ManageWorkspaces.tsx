import * as React from 'react';
import { PageContainer } from '../common/PageContainer';
import { PageHeader } from '../common/PageHeader';
import { Button, Tooltip } from '@blueprintjs/core';
import { DetailedListContainer } from '../common/DetailedListContainer';
import { DetailedListItem } from '../common/DetailedListItem';
import { useAppData } from '../../appdata/AppDataProvider';
import { remote } from "electron";
import { AppDataExportService } from '../../appdata/AppDataExportService';
import { Alerter } from '../Alerter';
import { AppDataImportService } from '../../appdata/AppDataImportService';

export const ManageWorkspaces: React.FC<{}> = props => {
  const appData = useAppData();

  return (
    <PageContainer header={(
      <PageHeader
        title="Manage workspaces"
        icon="cog"
        rightContent={(
          <>
            <Button outlined onClick={async () => {
              await AppDataImportService.initiateImportWizard(appData);
            }}>
              Import workspace
            </Button>
            {' '}
            <Button intent="primary" onClick={() => appData.openWorkspaceCreationWindow()} outlined>
              Create new workspace
            </Button>
          </>
        )}
      />
    )}>
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
