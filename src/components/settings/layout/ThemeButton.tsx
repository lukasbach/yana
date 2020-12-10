import * as React from 'react';
import { Theme } from '../../../common/theming';
import cxs from 'cxs';
import cx from 'classnames';
import { Icon } from '@blueprintjs/core';

const styles = {
  container: cxs({
    width: '220px',
    border: '3px solid transparent',
    padding: '4px',
    marginRight: '12px',
    marginBottom: '4px',
    borderRadius: '14px',
    ' h3': {
      margin: '4px 4px 0 4px'
    },
    position: 'relative'
  }),
  tick: cxs({
    position: 'absolute',
    bottom: '4px',
    right: '8px'
  }),
  activeContainer: cxs({
    borderColor: '#aaa'
  }),
  previewContainer: cxs({
    height: '120px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden'
  }),
  previewTopbarContainer: cxs({
    height: '12px',
    padding: '4px 0 0 6px',
    display: 'flex'
  }),
  previewTopbarHighlight: cxs({
    marginLeft: '2px',
    height: '4px',
    width: '12px',
    borderRadius: '4px',
    backgroundColor: '#fff'
  }),
  previewMainContainer: cxs({
    display: 'flex',
    flexGrow: 1,
  }),
  previewSidebarContainer: cxs({
    width: '60px',
    paddingTop: '8px'
  }),
  previewPrimaryContentContainer: cxs({
    backgroundColor: 'rgb(240, 240, 240)',
    position: 'relative',
    flexGrow: 1
  }),
  previewColorPaletteContainer: cxs({
    position: 'absolute',
    bottom: '20px',
    right: '0px',
    width: '100px',
    display: 'flex',
    borderBottomLeftRadius: '6px',
    borderTopLeftRadius: '6px',
    overflow: 'hidden',
    '> div': {
      width: '20px',
      height: '30px'
    }
  }),
  textDummy: cxs({
    width: '30px',
    height: '4px',
    borderRadius: '2px',
    margin: '3px 0 0 4px'
  }),
  textDummyHoverContainer: cxs({
    margin: '1px 0 0 0',
    padding: '2px 0 2px 0',
    '> div': {
      marginTop: '0 !important',
      marginBottom: '0 !important'
    }
  })
}

export const ThemeButton: React.FC<{
  theme: Theme,
  active?: boolean,
  onClick?: () => void,
}> = ({ theme, active, onClick }) => {

  return (
    <div
      className={cx(
        styles.container,
        active && styles.activeContainer,
        !active && cxs({
          cursor: 'pointer',
          ':hover': {
            borderColor: '#aaa'
          }
        })
      )}
      onClick={!active ? onClick : undefined}
    >
      <div className={cx(
        styles.previewContainer
      )}>
        <div className={cx(
          styles.previewTopbarContainer,
          cxs({ backgroundColor: theme.topBarColor })
        )}>
          <div className={cx(
            styles.previewTopbarHighlight,
            cxs({ backgroundColor: theme.primaryColor })
          )} />
          <div className={cx(
            styles.previewTopbarHighlight
          )} />
          <div className={cx(
            styles.previewTopbarHighlight
          )} />
          <div className={cx(
            styles.previewTopbarHighlight
          )} />
        </div>
        <div className={cx(
          styles.previewMainContainer
        )}>
          <div className={cx(
            styles.previewSidebarContainer,
            cxs({ backgroundColor: theme.sidebarColor })
          )}>
            <div className={cx(
              styles.textDummy,
              cxs({
                backgroundColor: theme.sidebarTextColor,
                width: '33px'
              })
            )} />
            <div className={cx(
              styles.textDummy,
              cxs({
                backgroundColor: theme.sidebarTextColor,
                width: '26px',
                marginLeft: '8px'
              })
            )} />
            <div className={cx(
              styles.textDummy,
              cxs({
                backgroundColor: theme.sidebarTextColor,
                width: '35px',
                marginLeft: '8px'
              })
            )} />
            <div className={cx(
              styles.textDummy,
              cxs({
                backgroundColor: theme.sidebarTextColor,
                width: '20px'
              })
            )} />
            <div className={cx(
              styles.textDummyHoverContainer,
              cxs({
                backgroundColor: theme.sidebarHoverColor
              })
            )}>
              <div className={cx(
                styles.textDummy,
                cxs({
                  backgroundColor: theme.sidebarTextColor,
                  width: '22px',
                  marginLeft: '8px'
                })
              )} />
            </div>
            <div className={cx(
              styles.textDummy,
              cxs({
                backgroundColor: theme.sidebarTextColor,
                width: '26px',
                marginLeft: '12px'
              })
            )} />
            <div className={cx(
              styles.textDummy,
              cxs({
                backgroundColor: theme.sidebarTextColor,
                width: '30px',
                marginLeft: '12px'
              })
            )} />
            <div className={cx(
              styles.textDummy,
              cxs({
                backgroundColor: theme.sidebarTextColor,
                width: '33px'
              })
            )} />
            <div className={cx(
              styles.textDummy,
              cxs({
                backgroundColor: theme.sidebarTextColor,
                width: '26px',
                marginLeft: '8px'
              })
            )} />
            <div className={cx(
              styles.textDummy,
              cxs({
                backgroundColor: theme.sidebarTextColor,
                width: '20px'
              })
            )} />
            <div className={cx(
              styles.textDummy,
              cxs({
                backgroundColor: theme.sidebarTextColor,
                width: '22px',
                marginLeft: '8px'
              })
            )} />
            <div className={cx(
              styles.textDummy,
              cxs({
                backgroundColor: theme.sidebarTextColor,
                width: '26px',
                marginLeft: '12px'
              })
            )} />
          </div>
          <div className={cx(
            styles.previewPrimaryContentContainer
          )}>
            <div className={cx(
              styles.previewColorPaletteContainer
            )}>
              <div className={cxs({
                backgroundColor: theme.primaryColor
              })} />
              <div className={cxs({
                backgroundColor: theme.topBarColor
              })} />
              <div className={cxs({
                backgroundColor: theme.sidebarColor
              })} />
              <div className={cxs({
                backgroundColor: theme.sidebarTextColor
              })} />
              <div className={cxs({
                backgroundColor: theme.sidebarHoverColor
              })} />
            </div>
          </div>
        </div>
      </div>
      <h3>{ theme.title ?? 'Custom theme' }</h3>
      { active && <div className={cx(
        styles.tick, cxs({ color: theme.primaryColor })
      )}>
        <Icon icon={'tick-circle'} iconSize={24} />
      </div> }
    </div>
  );
};
