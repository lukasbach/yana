import * as React from 'react';
import cxs from 'cxs';
import Color from 'color';
import { SideBarContent } from '../sidebar/SideBarContent';
import cx from 'classnames';
import { useTheme } from '../../common/theming';
import { MainContainer } from '../mainContent/MainContainer';
import { TopBar } from './TopBar';
// @ts-ignore
import ResizePanel from 'react-resize-panel';
import { Button, Icon, ResizeSensor } from '@blueprintjs/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSettings } from '../../appdata/AppDataProvider';
import { DevToolsSidebar } from '../devtools/DevToolsSidebar';
import { SpotlightTarget } from '@atlaskit/onboarding';
import * as remote from '@electron/remote';

const styles = {
  mainContainer: cxs({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ' ::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    ' ::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    ' ::-webkit-scrollbar-thumb': {
      borderRadius: '4px',
      backgroundColor: '#999',
    },
    ' ::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#666',
    },
  }),
  centralContainer: cxs({
    flexGrow: 1,
    display: 'flex',
    overflow: 'auto',
  }),
  sidebar: cxs({
    height: '100%',
    width: '100%',
    overflow: 'auto',
    position: 'relative',
    paddingBottom: '32px',
  }),
  sidebarSizeButton: cxs({
    height: '64px',
    position: 'sticky',
    bottom: '-32px',
    left: 0,
    textAlign: 'right',
    padding: '16px',
  }),
  sidebarResizeBorder: cxs({
    width: '6px',
    cursor: 'e-resize',
    backgroundColor: 'transparent',
    transform: 'translateX(-6px)',
  }),
  sidebarResizeHandle: cxs({
    display: 'none',
  }),
  mainContent: cxs({
    flexGrow: 1,
    height: '100%',
    overflow: 'hidden',
  }),
  devtools: cxs({
    width: '300px',
    minWidth: '300px',
    height: '100%',
    overflow: 'auto',
  }),
};

const SIZE_TO_COLLAPSE = 160;
const WINDOW_WIDTH_TO_FORCE_COLLAPSE_SIDEBAR = 750;
const currentWindow = remote.getCurrentWindow();

export const LayoutContainer: React.FC<{}> = props => {
  const theme = useTheme();
  const settings = useSettings();
  const lastSizeRef = useRef(0);
  const [collapsed, setCollapsed] = useState(false);
  const [forceCollapsed, setForceCollapsed] = useState(false);

  const collapseButtonContainer = (
    <div
      className={cx([
        styles.sidebarSizeButton,
        cxs({
          background: `linear-gradient(0deg, ${theme.sidebarColor} 0%, ${Color(theme.sidebarColor)
            .alpha(0.95)
            .toString()} 70%, rgba(0,0,0,0) 100%)`,
        }),
      ])}
    >
      <Button
        icon={<Icon icon={collapsed ? 'chevron-right' : 'chevron-left'} iconSize={24} />}
        onClick={() => {
          setForceCollapsed(forced => {
            setCollapsed(x => !x);
            if (forced) {
              currentWindow.setSize(WINDOW_WIDTH_TO_FORCE_COLLAPSE_SIDEBAR + 1, currentWindow.getSize()[1]);
              return false;
            }
            return forced;
          });
        }}
        minimal
      />
    </div>
  );

  useEffect(() => {
    const listener = () => {
      const width = currentWindow.getSize()[0];
      if (width < WINDOW_WIDTH_TO_FORCE_COLLAPSE_SIDEBAR) {
        setForceCollapsed(true);
        setCollapsed(true);
      } else {
        setForceCollapsed(false);
      }
    };

    currentWindow.on('resize', listener);

    return () => {
      currentWindow.removeListener('resize', listener);
    };
  }, []);

  return (
    <div className={styles.mainContainer}>
      <SpotlightTarget name="topbar">
        <TopBar />
      </SpotlightTarget>
      <div
        className={cx(
          styles.centralContainer,
          'app-central-container',
          collapsed &&
            lastSizeRef.current > SIZE_TO_COLLAPSE &&
            cxs({ '> :first-child > :first-child': { width: '64px !important' } })
        )}
      >
        <ResizePanel
          direction="e"
          handleClass={styles.sidebarResizeHandle}
          borderClass={cx(
            styles.sidebarResizeBorder,
            cxs({
              ':hover': {
                backgroundColor: theme.primaryColor,
              },
            })
          )}
          style={{ width: '320px', minWidth: 'auto', marginRight: '-6px' }}
        >
          <div
            className={cx(
              styles.sidebar,
              cxs({
                backgroundColor: theme.sidebarColor,
              })
            )}
          >
            <ResizeSensor
              onResize={e => {
                const width = e[0].contentRect.width;
                lastSizeRef.current = width;
                if (collapsed && width > SIZE_TO_COLLAPSE) {
                  setCollapsed(false);
                } else if (!collapsed && width <= SIZE_TO_COLLAPSE) {
                  setCollapsed(true);
                }
              }}
            >
              <div>
                <SpotlightTarget name="sidebar">
                  <div style={{ display: collapsed ? 'none' : 'block' }}>
                    <SideBarContent />
                  </div>
                  {collapseButtonContainer}
                </SpotlightTarget>
              </div>
            </ResizeSensor>
          </div>
        </ResizePanel>
        <div className={styles.mainContent}>
          <MainContainer />
        </div>
        {settings.devToolsOpen && (
          <div className={styles.devtools}>
            <DevToolsSidebar />
          </div>
        )}
      </div>
    </div>
  );
};
