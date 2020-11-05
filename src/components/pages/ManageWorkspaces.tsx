import * as React from 'react';
import { PageContainer } from '../common/PageContainer';
import { PageHeader } from '../common/PageHeader';
import { Button, Tooltip } from '@blueprintjs/core';
import { DetailedListContainer } from '../common/DetailedListContainer';
import { DetailedListItem } from '../common/DetailedListItem';
import { useAppData } from '../../appdata/AppDataProvider';
import { remote } from "electron";
import { AppDataExportService } from '../../appdata/AppDataExportService';
import { runRemoveWorkspaceWizard } from '../../appdata/runRemoveWorkspaceWizard';
import { runImportWizard } from '../../appdata/runImportWizard';
import { runAddWorkspaceWizard } from '../../appdata/runAddWorkspaceWizard';

export const ManageWorkspaces: React.FC<{}> = props => {
  const appData = useAppData();

  return (
    <PageContainer header={(
      <PageHeader
        title="Manage workspaces"
        icon="cog"
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
                      onClick={async () => runRemoveWorkspaceWizard(workspace, appData)}
                    />
                  </Tooltip>
                </>
              )}
            />
          ))
        }
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
