import * as React from 'react';
import { Colors } from '../../colors';
import cxs from 'cxs';
import Color from 'color';
import { remote } from 'electron';
import { SideBarContent } from '../sidebar/SideBarContent';
import cx from 'classnames';
import { useTheme } from '../../common/theming';
import { MainContainer } from '../mainContent/MainContainer';
import { TopBar } from './TopBar';
// @ts-ignore
import ResizePanel from "react-resize-panel";
import { Button, Icon, ResizeSensor } from '@blueprintjs/core';
import { useCallback, useRef, useState } from 'react';

const styles = {
  mainContainer: cxs({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ' ::-webkit-scrollbar': {
      width: '8px',
    },
    ' ::-webkit-scrollbar-track': {
      backgroundColor: 'transparent'
    },
    ' ::-webkit-scrollbar-thumb': {
      borderRadius: '4px',
      backgroundColor: '#999'
    },
    ' ::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#666'
    },
  }),
  tobBar: cxs({
    height: '32px',
  }),
  tobBarControls: cxs({
    float: 'right',
    width: 4 * 46 + 'px',
  }),
  topBarControlButton: cxs({
    fontFamily: 'Segoe MDL2 Assets',
    fontSize: '10px',
    width: '46px',
    height: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    outline: 'none',
    fontWeight: 'normal',
    ':hover': {
      backgroundColor: Color(Colors.primary).darken(0.2).toString(),
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
    padding: '16px'
  }),
  sidebarResizeBorder: cxs({
    width: '6px',
    cursor: 'e-resize',
    backgroundColor: 'transparent',
    transform: 'translateX(-6px)'
  }),
  sidebarResizeHandle: cxs({
    display: 'none'
  }),
  mainContent: cxs({
    flexGrow: 1,
    height: '100%',
    overflow: 'auto',
  }),
};

const SIZE_TO_COLLAPSE = 160;

export const LayoutContainer: React.FC<{}> = props => {
  const theme = useTheme();
  const lastSizeRef = useRef(0);
  const [collapsed, setCollapsed] = useState(false);

  const collapseButtonContainer = (
    <div className={cx([
      styles.sidebarSizeButton,
      cxs({ background: `linear-gradient(0deg, ${theme.sidebarColor} 0%, ${Color(theme.sidebarColor).alpha(.95).toString()} 70%, rgba(0,0,0,0) 100%)` })
    ])}>
      <Button
        icon={<Icon icon={collapsed ? 'chevron-right' : 'chevron-left'} iconSize={24} />}
        onClick={() => setCollapsed(x => !x)}
        minimal
      />
    </div>
  );

  return (
    <div className={styles.mainContainer}>
      <TopBar />
      <div className={cx(
        styles.centralContainer,
        'app-central-container',
        collapsed && lastSizeRef.current > SIZE_TO_COLLAPSE && cxs({ '> :first-child > :first-child': { width: '64px !important' } })
      )}>
        <ResizePanel
          direction="e"
          handleClass={styles.sidebarResizeHandle}
          borderClass={cx(
            styles.sidebarResizeBorder,
            cxs({
              ':hover': {
                backgroundColor: theme.primaryColor
              }
            })
          )}
          style={{ width: '320px', minWidth: 'auto', marginRight: '-6px' }}
        >
          <div
            className={cx(
              styles.sidebar,
              cxs({
                backgroundColor: theme.sidebarColor
              })
            )}
          >
            <ResizeSensor onResize={e => {
              const width = e[0].contentRect.width
              lastSizeRef.current = width;
              if (collapsed && width > SIZE_TO_COLLAPSE) {
                setCollapsed(false);
              } else if (!collapsed && width <= SIZE_TO_COLLAPSE) {
                setCollapsed(true);
              }
            }}>
              { !collapsed ? (
                <div>
                  <SideBarContent />
                  { collapseButtonContainer }
                </div>
              ) : (
                <div>
                  { collapseButtonContainer }
                </div>
              ) }
            </ResizeSensor>
          </div>
        </ResizePanel>
        <div className={styles.mainContent}>
          <MainContainer />
        </div>
      </div>
    </div>
  );
};