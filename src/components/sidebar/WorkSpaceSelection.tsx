import * as React from 'react';
import { useState } from 'react';
import {
  Button,
  Classes,
  Dialog,
  FormGroup,
  Icon,
  InputGroup,
  Menu,
  MenuDivider,
  MenuItem,
  Popover, Tooltip,
} from '@blueprintjs/core';
import { useAppData } from '../../appdata/AppDataProvider';
import { remote } from 'electron';
import path from 'path';
import cxs from 'cxs';
import cx from 'classnames';
import { useTheme } from '../../common/theming';
import Color from 'color';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { useMainContentContext } from '../mainContent/context';
import { InternalTag } from '../../datasource/InternalTag';
import { DataItemKind, NoteDataItem } from '../../types';
import { PageIndex } from '../../PageIndex';
// @ts-ignore
import brand from '../../logo.png';

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
    '> img': {
      height: '30px',
    }
  }),
  titleContainer: cxs({
    flexGrow: 1,
    display: 'inline-flex',
    alignItems: 'center',
    margin: '14px 8px 14px 20px',
    fontWeight: 'bold',
    fontSize: '14px'
  }),
  actionsContainer: cxs({
    margin: '14px 14px 14px 0',
    display: 'flex',
    alignItems: 'center'
  }),
  actionsButton: cxs({
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer'
  })
}

export const WorkSpaceSelection: React.FC<{}> = props => {
  const appData = useAppData();
  const dataInterface = useDataInterface();
  const mainContent = useMainContentContext();
  const theme = useTheme();

  const actionsButtonClass = cxs({
    color: theme.sidebarTextColor,
    ':hover': {
      color: Color(theme.sidebarTextColor).lighten(.3).toString(),
    }
  })

  return (
    <>
      <div className={style.popoverContainer}>
        <Popover
          minimal
          content={
            <Menu>
              <MenuDivider title="Switch Workspace" />
              {
                appData.workspaces.map(workspace => (
                  <MenuItem key={workspace.name} text={workspace.name} onClick={() => appData.setWorkSpace(workspace)} />
                ))
              }
              <MenuDivider title="More..." />
              <MenuItem
                text="Create new Workspace"
                icon="add"
                onClick={() => appData.openWorkspaceCreationWindow()}
              />
              <MenuItem
                text="Manage Workspaces"
                icon="database"
                onClick={() => mainContent.openInCurrentTab(PageIndex.ManageWorkspaces)}
              />
              <MenuItem
                text="Yana Settings"
                icon="cog"
                onClick={() => mainContent.openInCurrentTab(PageIndex.Settings)}
              />
              <MenuItem
                text="About Yana"
                icon="help"
                onClick={() => mainContent.openInCurrentTab(PageIndex.About)}
              />
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
            {/*<div className={style.iconContainer}>
              <img src={brand} />
            </div>*/}
            <div
              className={cx(
                Classes.TEXT_OVERFLOW_ELLIPSIS,
                style.titleContainer,
                cxs({ color: Color(theme.sidebarTextColor).lighten(.3).toString() })
              )}
            >
              { appData.currentWorkspace.name }&nbsp;&nbsp;
              <Icon icon={'chevron-down'} iconSize={12} />
            </div>
            <div className={style.actionsContainer}>
              <Tooltip position={'bottom'} content={'Settings'}>
                <button
                  className={cx(actionsButtonClass, style.actionsButton)}
                  onClick={e => {
                    e.stopPropagation();
                    mainContent.openInCurrentTab(PageIndex.Settings);
                  }}
                >
                  <Icon icon="cog" />
                </button>
              </Tooltip>
              <Tooltip position={'bottom'} content={'Create new draft note'}>
                <button
                  className={cx(actionsButtonClass, style.actionsButton)}
                  onClick={e => {
                    e.stopPropagation();
                    dataInterface.createDataItem({
                      name: 'New Draft',
                      tags: [InternalTag.Draft],
                      kind: DataItemKind.NoteItem,
                      childIds: [],
                      lastChange: new Date().getTime(),
                      created: new Date().getTime(),
                      noteType: 'atlaskit-editor-note'
                    } as any).then(item => mainContent.newTab(item));
                  }}
                >
                  <Icon icon="add" />
                </button>
              </Tooltip>
            </div>
          </div>
        </Popover>
      </div>
    </>
  );
};
