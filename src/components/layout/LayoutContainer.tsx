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

const styles = {
  mainContainer: cxs({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
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
  }),
  sidebar: cxs({
    width: '320px',
  }),
  mainContent: cxs({
    flexGrow: 1,
    height: '100%'
  }),
};

export const LayoutContainer: React.FC<{}> = props => {
  const theme = useTheme();
  return (
    <div className={styles.mainContainer}>
      <TopBar />
      <div className={cx(styles.centralContainer, 'app-central-container')}>
        <div
          className={cx(
            styles.sidebar,
            cxs({
              backgroundColor: theme.sidebarColor
            })
          )}
        >
          <SideBarContent />
        </div>
        <div className={styles.mainContent}>
          <MainContainer />
        </div>
      </div>
    </div>
  );
};
