import * as React from 'react';
import cxs from 'cxs';
import Color from 'color';
import { Colors } from '../../colors';
import cx from 'classnames';
import { remote } from "electron";
import { useTheme } from '../../common/theming';
import { useMainContentContext } from '../mainContent/context';
import { Icon } from '@blueprintjs/core';

const styles = {
  tobBar: cxs({
    height: '32px',
    display: 'flex',
  }),
  dragArea: cxs({
    flexGrow: 1,
  }),
  tabsContainer: cxs({
    display: 'flex'
  }),
  tab: cxs({
    padding: '8px 16px',
    marginLeft: '8px',
    cursor: 'pointer',
    position: 'relative',
    ':hover': {
      '> div': {
        opacity: 1
      }
    }

  }),
  closeContainer: cxs({
    position: 'absolute',
    top: 0,
    right: '4px',
    padding: '4px 2px 4px 2px',
    marginTop: '2px',
    opacity: 0,
    transition: '.1s all ease',
    ':hover': {
      color: 'white'
    }
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
      <div
        className={styles.tabsContainer}
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        {
          mainContent.tabs.map((tab, idx) => {
            const id = tab.dataItem?.id ?? tab.page ?? 'unknown';
            const name = tab.dataItem?.name ?? tab.page ?? 'Unknown name';

            return (
              <div
                key={id + idx}
                className={cx(
                  styles.tab,
                  cxs({
                    color: mainContent.openTabId === idx ? 'white' : Color(theme.topBarColor).lighten(1).toString(),
                    borderBottom: mainContent.openTabId === idx ? `4px solid ${theme.primaryColor}` : undefined,
                    fontWeight: mainContent.openTabId === idx ? 'bold' : 'normal',
                    ':hover': {
                      borderBottom: mainContent.openTabId !== idx ? `4px solid white` : undefined,
                    }
                  })
                )}
                onClick={() => mainContent.activateTab(idx)}
              >
                { name.substr(0, 12) }{ name.length > 12 ? '...' : '' }
                <div
                  className={cx(
                    styles.closeContainer,
                    cxs({
                      backgroundColor: theme.topBarColor
                    })
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    mainContent.closeTab(idx)
                  }}
                >
                  <Icon icon={'cross'} />
                </div>
              </div>
            );
          })
        }
      </div>
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
