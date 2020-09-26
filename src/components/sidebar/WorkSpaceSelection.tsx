import * as React from 'react';
import { Button, Classes, Dialog, FormGroup, InputGroup, Menu, MenuItem, Popover } from '@blueprintjs/core';
import { useState } from 'react';
import { useAppData } from '../../appdata/AppDataProvider';
import { remote } from 'electron';
import path from 'path';
import cxs from 'cxs';
import cx from 'classnames';
import { useTheme } from '../../common/theming';
import Color from 'color';

const style = {
  popoverContainer: cxs({
    '> span': {
      width: '100%'
    },
    '> span > span': {
      width: '100%'
    }
  }),
  container: cxs({
    display: 'flex',
    cursor: 'pointer'
  }),
  iconContainer: cxs({
    margin: '14px 8px 14px 14px',
    '> div': {
      width: '30px',
      height: '30px',
      borderRadius: 9999,
      backgroundColor: '#fff'
    }
  }),
  titleContainer: cxs({
    flexGrow: 1,
    display: 'inline-flex',
    alignItems: 'center',
    margin: '14px 8px 14px 0',
    fontWeight: 'bold',
    fontSize: '14px'
  }),
  actionsContainer: cxs({
    margin: '14px 14px 14px 0'
  }),
}

export const WorkSpaceSelection: React.FC<{}> = props => {
  const appData = useAppData();
  const theme = useTheme();
  const [createWorkspaceDialogOpen, setWorkspaceDialogOpen] = useState(false);
  const [createWorkspaceName, setCreateWorkspaceName] = useState('New Workspace');
  const [createWorkspacePath, setCreateWorkspacePath] = useState(
    path.join(remote.app.getPath('home'), 'yana-workspace')
  );

  return (
    <>
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

      <div className={style.popoverContainer}>
        <Popover
          minimal
          content={
            <Menu>
              {
                appData.workspaces.map(workspace => (
                  <MenuItem key={workspace.name} text={workspace.name} onClick={() => appData.setWorkSpace(workspace)} />
                ))
              }
              <MenuItem text="Create Workspace" onClick={() => setWorkspaceDialogOpen(true)} />
            </Menu>
          }
        >
          <div className={cx(
            style.container,
            cxs({
              ':hover': {
                backgroundColor: theme.sidebarHoverColor
              }
            })
          )}>
            <div className={style.iconContainer}>
              <div />
            </div>
            <div
              className={cx(
                style.titleContainer,
                cxs({ color: Color(theme.sidebarTextColor).lighten(.3).toString() })
              )}
            >
              { appData.currentWorkspace.name }
            </div>
            <div className={style.actionsContainer}>
              <Button icon={'cog'} minimal />
              <Button icon={'add'} minimal />
            </div>
          </div>
        </Popover>
      </div>
    </>
  );
};
