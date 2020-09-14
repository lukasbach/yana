import * as React from 'react';
import { Colors } from '../../colors';
import cxs from 'cxs';
import Color from 'color';
import { remote } from 'electron';
import { SideBarContent } from '../sidebar/SideBarContent';

const styles = {
  mainContainer: cxs({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  }),
  tobBar: cxs({
    backgroundColor: Color(Colors.primary).darken(0.1).toString(),
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
    backgroundColor: Colors.primary,
    width: '320px',
  }),
  mainContent: cxs({
    flexGrow: 1,
  }),
};

export const LayoutContainer: React.FC<{}> = props => {
  console.log(remote.getCurrentWindow());
  return (
    <div className={styles.mainContainer}>
      <div className={styles.tobBar} style={{ webkitAppRegion: 'drag' } as any}>
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
        <div className={styles.sidebar}>
          <SideBarContent />
        </div>
        <div className={styles.mainContent}>main</div>
      </div>
    </div>
  );
};
