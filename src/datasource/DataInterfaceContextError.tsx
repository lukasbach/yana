import { Button, ButtonGroup, Menu, MenuItem, NonIdealState, Popover, Position } from '@blueprintjs/core';
import * as React from 'react';
import { useAppData } from '../appdata/AppDataProvider';
import * as remote from '@electron/remote';

export const DataInterfaceContextError: React.FC<{
  message: string;
}> = props => {
  const appdata = useAppData();

  return (
    <NonIdealState
      title="Error"
      description={
        <>
          <p>The following error occured when loading workspace {appdata.currentWorkspace.name}:</p>
          <p>{props.message}</p>uti
        </>
      }
      action={
        <>
          <ButtonGroup vertical={true} minimal={true}>
            {appdata.workspaces.length > 0 && (
              <Popover
                content={
                  <Menu>
                    {appdata.workspaces.map(workspace => (
                      <MenuItem text={workspace.name} onClick={() => appdata.setWorkSpace(workspace)} />
                    ))}
                  </Menu>
                }
                position={Position.BOTTOM}
              >
                <Button text="Open other workspace" />
              </Popover>
            )}
            <Button
              text="Show backups"
              onClick={() => {
                remote.shell.openPath(appdata.settings.autoBackupLocation);
              }}
            />
            <Button
              text="Create new workspace"
              onClick={() => {
                appdata.openWorkspaceCreationWindow();
              }}
            />
          </ButtonGroup>
        </>
      }
    />
  );
};
