import * as React from 'react';
import { Button, Classes, Dialog, FormGroup, InputGroup, Menu, MenuItem, Popover } from '@blueprintjs/core';
import { useState } from 'react';
import { useAppData } from '../../appdata/AppDataProvider';
import { remote } from 'electron';
import path from 'path';

export const WorkSpaceSelection: React.FC<{}> = props => {
  const appData = useAppData();
  const [createWorkspaceDialogOpen, setWorkspaceDialogOpen] = useState(false);
  const [createWorkspaceName, setCreateWorkspaceName] = useState('New Workspace');
  const [createWorkspacePath, setCreateWorkspacePath] = useState(
    path.join(remote.app.getPath('home'), 'yana-workspace')
  );

  return (
    <div>
      <Dialog
        isOpen={createWorkspaceDialogOpen}
        onClose={() => setWorkspaceDialogOpen(false)}
        title="Create new workspace"
      >
        <div className={Classes.DIALOG_BODY}>
          <FormGroup label="Path to workspace">
            <InputGroup onChange={(e: any) => setCreateWorkspacePath(e.target.value)} value={createWorkspacePath} />
          </FormGroup>
          <FormGroup label="Workspace Name">
            <InputGroup onChange={(e: any) => setCreateWorkspaceName(e.target.value)} value={createWorkspaceName} />
          </FormGroup>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              intent={'primary'}
              onClick={() => {
                appData
                  .createWorkSpace(createWorkspaceName, createWorkspacePath)
                  .then(() => setWorkspaceDialogOpen(false));
              }}
            >
              Create
            </Button>
          </div>
        </div>
      </Dialog>

      <Popover
        content={
          <Menu>
            {
              appData.workspaces.map(workspace => (
                <MenuItem text={workspace.name} onClick={() => appData.setWorkSpace(workspace)} />
              ))
            }
            <MenuItem text="Create Workspace" onClick={() => setWorkspaceDialogOpen(true)} />
          </Menu>
        }
      >
        <Button minimal={true}>Workspace selection</Button>
      </Popover>
    </div>
  );
};
