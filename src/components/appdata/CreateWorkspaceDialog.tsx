import * as React from 'react';
import { Button, Classes, Dialog, FormGroup, InputGroup } from '@blueprintjs/core';
import { useState } from 'react';
import path from "path";
import { useAppData } from '../../appdata/AppDataProvider';
import { getElectronPath } from '../../utils';

export const CreateWorkspaceDialog: React.FC<{
  isOpen: boolean,
  onSetIsOpen: (isOpen: boolean) => void,
}> = props => {
  const appData = useAppData();
  const [createWorkspaceName, setCreateWorkspaceName] = useState('New Workspace');
  const [createWorkspacePath, setCreateWorkspacePath] = useState(
    path.join(getElectronPath('home'), 'yana-workspace')
  );

  return (
    <Dialog
      isOpen={props.isOpen}
      onClose={() => props.onSetIsOpen(false)}
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
                .then(() => props.onSetIsOpen(false));
            }}
          >
            Create
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
