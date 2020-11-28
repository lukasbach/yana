import * as React from 'react';
import cxs from 'cxs';
import Color from 'color';
import cx from 'classnames';
import { remote } from "electron";
import { useTheme } from '../../common/theming';
import { TabContainer } from './TabContainer';
import { useEffect, useState } from 'react';
import * as os from 'os';
import { Icon } from '@blueprintjs/core';

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
    width: 3 * 46 + 'px',
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
  }),
};

const initialMaximizedState = remote.getCurrentWindow().isMaximized();
const isWindows = os.platform() === 'win32' && os.release().startsWith('10');

export const TopBar: React.FC<{}> = props => {
  const theme = useTheme();
  const [isMaximized, setIsMaximized] = useState(initialMaximizedState);

  useEffect(() => {
    const onMaximize = () => setIsMaximized(true);
    const onUnmaximize = () => setIsMaximized(false);
    remote.getCurrentWindow().on('maximize', onMaximize);
    remote.getCurrentWindow().on('unmaximize', onUnmaximize);
    return () => {
      remote.getCurrentWindow().removeListener('maximize', onMaximize);
      remote.getCurrentWindow().removeListener('unmaximize', onUnmaximize)
    }
  }, []);

  const topBarControlButtonClass = cx(
    styles.topBarControlButton,
    cxs({
      ':hover': {
        backgroundColor: Color(theme.topBarColor).darken(0.3).toString(),
      },
    })
  );

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
        <button className={topBarControlButtonClass} onClick={() => remote.getCurrentWindow().minimize()}>
          { isWindows ? <>&#xE921;</> : <Icon icon={'minus'} /> }
        </button>
        { isMaximized ? (
          <button className={topBarControlButtonClass} onClick={() => remote.getCurrentWindow().unmaximize()}>
            { isWindows ? <>&#xE923;</> : <Icon icon={'minimize'} /> }
          </button>
        ) : (
          <button className={topBarControlButtonClass} onClick={() => remote.getCurrentWindow().maximize()}>
            { isWindows ? <>&#xE922;</> : <Icon icon={'maximize'} /> }
          </button>
        ) }
        <button className={topBarControlButtonClass} onClick={() => remote.getCurrentWindow().close()}>
          { isWindows ? <>&#xE8BB;</> : <Icon icon={'cross'} /> }
        </button>
      </div>
    </div>
  );
};
