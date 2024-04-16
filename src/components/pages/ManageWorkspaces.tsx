import * as React from 'react';
import { PageContainer } from '../common/PageContainer';
import { PageHeader } from '../common/PageHeader';
import { Button, Tooltip } from '@blueprintjs/core';
import { DetailedListContainer } from '../common/DetailedListContainer';
import { DetailedListItem } from '../common/DetailedListItem';
import { useAppData } from '../../appdata/AppDataProvider';
import { remote } from 'electron';
import { AppDataExportService } from '../../appdata/AppDataExportService';
import { runRemoveWorkspaceWizard } from '../../appdata/runRemoveWorkspaceWizard';
import { runImportWizard } from '../../appdata/runImportWizard';
import { runAddWorkspaceWizard } from '../../appdata/runAddWorkspaceWizard';
import { useScreenView } from '../telemetry/useScreenView';
import { Alerter } from '../Alerter';
import { runMarkdownExport } from '../../appdata/runMarkdownExport';
import { TelemetryService } from '../telemetry/TelemetryProvider';
import { TelemetryEvents } from '../telemetry/TelemetryEvents';

export const ManageWorkspaces: React.FC<{}> = props => {
  useScreenView('manage-workspaces');
  const appData = useAppData();

  return (
    <PageContainer header={<PageHeader title="Manage workspaces" icon="cog" />}>
      <DetailedListContainer>
        {appData.workspaces.map(workspace => (
          <DetailedListItem
            key={workspace.dataSourceOptions.sourcePath}
            title={workspace.name}
            subtitle={workspace.dataSourceOptions.sourcePath}
            icon={'database'}
            actionButtons={
              <>
                <Tooltip content="Move workspace up" position={'bottom'}>
                  <Button outlined icon={'chevron-up'} onClick={() => appData.moveWorkspace(workspace, 'up')} />
                </Tooltip>
                <Tooltip content="Move workspace down" position={'bottom'}>
                  <Button outlined icon={'chevron-down'} onClick={() => appData.moveWorkspace(workspace, 'down')} />
                </Tooltip>
                <Tooltip content="Rename workspace" position={'bottom'}>
                  <Button
                    outlined
                    icon={'edit'}
                    onClick={() => {
                      Alerter.Instance.alert({
                        confirmButtonText: 'Okay',
                        content: 'Choose a new name for the workspace:',
                        canOutsideClickCancel: true,
                        canEscapeKeyCancel: true,
                        prompt: {
                          type: 'string',
                          defaultValue: workspace.name,
                          placeholder: 'Workspace name',
                          onConfirmText: async newName => {
                            try {
                              await appData.renameWorkspace(workspace, newName);
                            } catch (e) {
                              Alerter.Instance.alert({
                                confirmButtonText: 'Okay',
                                content: 'Error: ' + e.message,
                                canOutsideClickCancel: true,
                                canEscapeKeyCancel: true,
                              });
                            }
                          },
                        },
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip content="Switch to workspace" position={'bottom'}>
                  <Button outlined icon={'chevron-right'} onClick={() => appData.setWorkSpace(workspace)} />
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
                        await AppDataExportService.exportTo(result.filePath, workspace, console.log);
                        remote.shell.showItemInFolder(result.filePath);
                      }
                    }}
                  />
                </Tooltip>
                <Tooltip content="Export workspace to markdown files" position={'bottom'}>
                  <Button
                    outlined
                    icon={'export'}
                    onClick={async () => {
                      const result = await remote.dialog.showOpenDialog({
                        buttonLabel: 'Export',
                        properties: ['createDirectory', 'openDirectory'],
                        title: 'Choose a location to export your workspace to',
                      });
                      if (result.filePaths) {
                        Alerter.Instance.alert({
                          content: (
                            <>
                              Warning: This will delete existing contents in <b>{result.filePaths[0]}</b> and
                              export the notebook there. Do you want to continue?
                            </>
                          ),
                          intent: 'danger',
                          cancelButtonText: 'Cancel',
                          confirmButtonText: 'Continue',
                          prompt: {
                            type: "boolean",
                            defaultValue: false,
                            text: "Export code files as markdown files",
                            onConfirmBoolean: async (makeTextFilesToMarkdown) => {
                              await runMarkdownExport({
                                targetFolder: result.filePaths[0],
                                makeTextFilesToMarkdown
                              }, workspace);
                              remote.shell.showItemInFolder(result.filePaths[0]);
                            }
                          }
                        });
                      }
                    }}
                  />
                </Tooltip>
                <Tooltip content="Delete workspace" position={'bottom'}>
                  <Button
                    outlined
                    intent="danger"
                    icon={'trash'}
                    onClick={async () => runRemoveWorkspaceWizard(workspace, appData)}
                  />
                </Tooltip>
              </>
            }
          />
        ))}
      </DetailedListContainer>

      <DetailedListContainer>
        <DetailedListItem
          title="Create new workspace"
          subtitle="Initialize an empty workspace on your drive to hold lots of notes!"
          icon="new-object"
          onClick={() => appData.openWorkspaceCreationWindow()}
        />
        <DetailedListItem
          title="Import workspace"
          subtitle="Import a zipped workspace which you've exported from Yana before."
          icon="bring-data"
          onClick={() => runImportWizard(appData)}
        />
        <DetailedListItem
          title="Add existing workspace"
          subtitle="Add a local workspace from your local drive. You can use this to add a workspace within a cloud folder that was created on another device."
          icon="new-link"
          onClick={() => runAddWorkspaceWizard(appData)}
        />
      </DetailedListContainer>
    </PageContainer>
  );
};
