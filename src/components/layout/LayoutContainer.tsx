import * as React from 'react';
import { Colors } from '../../colors';
import cxs from 'cxs';
import Color from 'color';
import { remote } from 'electron';
import { SideBarContent } from '../sidebar/SideBarContent';
import cx from 'classnames';
import { useTheme } from '../../common/theming';

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
  }),
};

export const LayoutContainer: React.FC<{}> = props => {
  const theme = useTheme();
  return (
    <div className={styles.mainContainer}>
      <div
        className={cx(
          styles.tobBar,
          cxs({
            backgroundColor: theme.topBarColor,
          })
        )}
        style={{ webkitAppRegion: 'drag' } as any}
      >
        <div className={styles.tobBarControls} style={{ webkitAppRegion: 'no-drag' } as any}>
          <button className={styles.topBarControlButton} onClick={() => remote.getCurrentWindow().minimize()}>
            &#xE921;
          </button>
          <button className={styles.topBarControlButton} onClick={() => remote.getCurrentWindow().setFullScreen(false)}>
            &#xE923;
          </button>
          <button className={styles.topBarControlButton} onClick={() => remote.getCurrentWindow().setFullScreen(true)}>
            &#xE922;
          </button>
          <button className={styles.topBarControlButton} onClick={() => remote.getCurrentWindow().close()}>
            &#xE8BB;
          </button>
        </div>
      </div>
      <div className={styles.centralContainer}>
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
        <div className={styles.mainContent}>main</div>
      </div>
    </div>
  );
};
