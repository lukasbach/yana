import * as React from 'react';
import cxs from 'cxs';
import Color from 'color';
import { Colors } from '../../colors';
import cx from 'classnames';
import { remote } from "electron";
import { useTheme } from '../../common/theming';
import { useMainContentContext } from '../mainContent/context';
import { Icon } from '@blueprintjs/core';
import { pages } from '../../pages';
import { TabContainer } from './TabContainer';

const styles = {
  tobBar: cxs({
    height: '32px',
    display: 'flex',
  }),
  dragArea: cxs({
    flexGrow: 1,
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
};

export const TopBar: React.FC<{}> = props => {
  const theme = useTheme();
  const mainContent = useMainContentContext();

  return (
    <div
      className={cx(
        styles.tobBar,
        cxs({
          backgroundColor: theme.topBarColor,
        })
      )}
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <TabContainer />
      <div className={styles.dragArea} />
      <div className={styles.tobBarControls} style={{ WebkitAppRegion: 'no-drag' } as any}>
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
  );
};
