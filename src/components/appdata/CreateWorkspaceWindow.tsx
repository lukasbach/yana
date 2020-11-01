import * as React from 'react';
import cxs from 'cxs';
import { defaultTheme } from '../../common/theming';
import { Button, ButtonGroup, Classes, ControlGroup, FormGroup, Icon, IconName, InputGroup } from '@blueprintjs/core';
import { useAppData } from '../../appdata/AppDataProvider';
import { useState } from 'react';
import path from "path";
import { getElectronPath } from '../../utils';
import pkg from '../../../package.json';
import { remote } from "electron";
import { AppDataImportService } from '../../appdata/AppDataImportService';

const styles = {
  container: cxs({
    width: '100%',
    height: '100%',
    position: 'relative',
    borderTop: `8px solid ${defaultTheme.primaryColor}`,
    padding: '8px',
  }),
  draggableContainer: cxs({
    WebkitAppRegion: 'drag',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  }),
  closeContainer: cxs({
    position: 'fixed',
    top: 0,
    right: 0,
    padding: '16px',
    '> button': {
      padding: '16px',
      borderRadius: '1000px',
      backgroundColor: 'transparent',
      border: 0,
      cursor: 'pointer',
      WebkitAppRegion: 'no-drag',
      ':hover': {
        backgroundColor: '#eee',
      },
      ':active': {
        backgroundColor: '#d2d2d2',
      }
    }
  }),
  mainContainer: cxs({
    flexGrow: 1,
    display: 'flex',
    '> div': {
      padding: '64px',
      width: '50%'
    },
    '@media screen and (min-width: 1400px)': {
      margin: '0 256px',
    }
  }),
  left: cxs({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    '@media screen and (max-width: 800px)': {
      display: 'none'
    }
  }),
  right: cxs({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    '> div': {
      WebkitAppRegion: 'no-drag',
    },
    '> p': {
      margin: '8px 0 48px 0',
    },
    '> h1': {
      margin: '24px 0 12px 0',
    },
    '@media screen and (max-width: 800px)': {
      width: '100% !important',
    }
  }),
  bottom: cxs({
    WebkitAppRegion: 'no-drag',
    backgroundColor: defaultTheme.sidebarColor,
    margin: '-8px',
    padding: '16px 64px',
    color: 'white',
    display: 'flex',
    '@media screen and (max-width: 800px)': {
      display: 'block',
      '> div': {
        width: '100% !important',
      },
    },
    '> div': {
      width: '50%',
    },
    '> :nth-child(1)': {
    },
    '> :nth-child(2)': {
      textAlign: 'right'
    },
    ' h2': {
      margin: 0
    },
    ' button': {
      color: 'white !important',
    },
    ' svg': {
      fill: 'white !important',
    },
    ' a': {
      color: 'white !important',
      textDecoration: 'underline',
    }
  }),

  justifyRight: cxs({
    textAlign: 'right'
  }),

  brandPoint: cxs({
    display: 'flex',
    margin: '0 0 16px 0',
    padding: '8px',
    backgroundColor: '#d6d6d6',
    borderRadius: '16px',
    width: '100%',
  }),
  brandIconContainer: cxs({
    padding: '12px',
    borderRadius: '1000px',
    backgroundColor: defaultTheme.primaryColor,
    marginRight: '16px'
  }),
  brandText: cxs({
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
    marginRight: '16px',
  })
}

const BrandPoint: React.FC<{ icon: IconName }> = (props) => (
  <div className={styles.brandPoint}>
    <div className={styles.brandIconContainer}>
      <Icon icon={props.icon} iconSize={32} color={'white'} />
    </div>
    <div className={styles.brandText}>
      { props.children }
    </div>
  </div>
);

export const CreateWorkspaceWindow: React.FC<{
  onClose: () => void,
  onCreate: (name: string, path: string) => void,
  onImported: () => void,
}> = props => {
  const appData = useAppData();
  const [createWorkspaceName, setCreateWorkspaceName] = useState('New Workspace');
  const [createWorkspacePath, setCreateWorkspacePath] = useState(
    path.join(getElectronPath('home'), 'yana-workspace')
  );

  return (
    <div className={styles.container}>
      <div className={styles.draggableContainer}>
        <div className={styles.closeContainer}>
          <button onClick={props.onClose}>
            <Icon icon={'cross'} iconSize={32} />
          </button>
        </div>
        <div className={styles.mainContainer}>
          <div className={styles.left}>
            <BrandPoint icon={'diagram-tree'}>
              Organize your thoughts in your Yana Notebook
            </BrandPoint>
            <BrandPoint icon={'tag'}>
              Find what you're looking for by searching for content or tags
            </BrandPoint>
            <BrandPoint icon={'code'}>
              Manage rich-text notes as well as code snippets.
            </BrandPoint>
          </div>
          <div className={styles.right}>
            <div>
              <h1>Create a new Workspace</h1>
              <p className={Classes.TEXT_MUTED + ' ' + Classes.RUNNING_TEXT}>
                Yana organizes your notes in distinct workspaces. Each workspace is stored at a particular
                location on your hard drive. Remember that you can choose a location within a cloud drive
                to synchronize workspaces across devices. You can add more workspaces later.
              </p>

              <FormGroup label="Path to workspace">
                <ControlGroup fill>
                  <InputGroup
                    fill
                    leftIcon={'floppy-disk'}
                    onChange={(e: any) => setCreateWorkspacePath(e.target.value)}
                    value={createWorkspacePath}
                  />
                  <Button
                    outlined
                    rightIcon="chevron-right"
                    onClick={async () => {
                      const result = await remote.dialog.showOpenDialog({
                        defaultPath: createWorkspacePath,
                        buttonLabel: 'Choose',
                        title: 'Choose location for new workspace',
                        properties: ['createDirectory', 'openDirectory']
                      });
                      if (result.canceled) return;
                      setCreateWorkspacePath(result.filePaths[0]);
                    }}
                  >
                    &nbsp;&nbsp;&nbsp;Choose&nbsp;path...
                  </Button>
                </ControlGroup>
              </FormGroup>
              <FormGroup label="Workspace Name">
                <InputGroup
                  leftIcon={'tag'}
                  onChange={(e: any) => setCreateWorkspaceName(e.target.value)}
                  value={createWorkspaceName}
                />
              </FormGroup>

              <div className={styles.justifyRight}>
                <Button
                  large outlined
                  intent={'primary'}
                  rightIcon={'chevron-right'}
                  onClick={() => {
                    props.onCreate(createWorkspaceName, createWorkspacePath);
                  }}
                >
                  Create workspace
                </Button>
              </div>

              <p>
                You can also&nbsp;
                <a href="#" onClick={async () => {
                  await AppDataImportService.initiateImportWizard(appData);
                  props.onImported();
                }}>
                  import an existing workspace
                </a>.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <div>
            <h2>Yana</h2>
            <p>
              You are currently using <em>Yana {pkg.version}</em>
            </p>
          </div>
          <div>
            <p>
              Developed with <Icon icon={'heart'} /> and TypeScript by <a href="#" onClick={() => remote.shell.openExternal('https://lukasbach.com')}>Lukas Bach</a>.
            </p>
            <ButtonGroup minimal color={'#fff'}>
              <Button
                icon={'git-branch'}
                onClick={() => remote.shell.openExternal('https://github.com/lukasbach/yana')}
              >
                GitHub
              </Button>
              <Button
                icon={'help'}
                onClick={() => remote.shell.openExternal('https://github.com/lukasbach/yana')}
              >
                Project Page
              </Button>
              <Button
                icon={'user'}
                onClick={() => remote.shell.openExternal('https://lukasbach.com')}
              >
                About me
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </div>
    </div>
  );
};
