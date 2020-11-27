import * as React from 'react';
import cxs from 'cxs';
import cx from 'classnames';
import Color from 'color';
import { Button, Icon, IconName, Tooltip } from '@blueprintjs/core';
import { useAppData } from '../../appdata/AppDataProvider';

const styles = {
  container: cxs({
    padding: '56px 32px 16px 32px',
    display: 'flex',
    position: 'relative'
  }),
  containerCollapsed: cxs({
    padding: '12px 32px 12px 32px',
  }),
  collapseContainer: cxs({
    position: 'absolute',
    top: '12px',
    right: '12px',
  }),
  leftContainer: cxs({
    flexGrow: 1
  }),
  rightContainer: cxs({
    textAlign: 'right',
    '> div': {
      marginBottom: '4px',
    },
    ' button': {
      marginBottom: '2px'
    },
  }),
  title: cxs({
    position: 'relative',
    fontWeight: 400,
    fontSize: '32px',
    margin: 0,
    height: '42px'
  }),
  titleInner: cxs({
    position: 'absolute',
    top: 0,
    left: 0,
    right: '100px',
    bottom: 0,
    display: 'flex',
    '> span.bp3-icon': {
      margin: '0 14px 0 0px',
      transform: 'translateY(4px)'
    }
  }),
  titleSubtext: cxs({
    color: Color('#fff').darken(.35).toString(),
    fontSize: '12px',
    margin: '12px 0 0 0'
  }),
  lowerContent: cxs({
    margin: '0 32px 16px 32px',
  }),
  lowerContentFlush: cxs({
    marginBottom: '0 !important'
  }),
};

export const PageHeader: React.FC<{
  title: string | React.ReactNode;
  icon?: IconName;
  iconColor?: string;
  titleSubtext?: string | React.ReactNode;
  rightContent?: React.ReactNode;
  lowerContent?: React.ReactNode;
  lowerContentFlush?: boolean;
}> = props => {
  const appData = useAppData();
  const pageHeaderCollapsed = appData.settings.pageHeaderCollapsed;

  return (
    <>
      <div className={cx(
        styles.container,
        pageHeaderCollapsed && styles.containerCollapsed
      )}>
        <div className={styles.leftContainer}>
          <h1 className={styles.title}>
            <div className={styles.titleInner}>
              { props.icon && <Icon icon={props.icon} color={props.iconColor} iconSize={32} /> }
              { props.title }
            </div>
          </h1>
          { !pageHeaderCollapsed && (
            <p className={styles.titleSubtext}>
              { props.titleSubtext }
            </p>
          )}
        </div>
        { !pageHeaderCollapsed && (
          <div className={styles.rightContainer}>
            { props.rightContent }
          </div>
        ) }
        <div className={styles.collapseContainer}>
          <Tooltip
            content={!pageHeaderCollapsed ? 'Collapse header' : undefined}
            position={'bottom'}
            hoverOpenDelay={500}
          >
            <Button
              minimal
              icon={pageHeaderCollapsed ? 'chevron-down' : 'chevron-up'}
              onClick={() => {
                appData.saveSettings({
                  ...appData.settings,
                  pageHeaderCollapsed: !pageHeaderCollapsed
                })
              }}
              children={pageHeaderCollapsed ? 'Show header' : undefined}
            />
          </Tooltip>
        </div>
      </div>
      { props.lowerContent && !pageHeaderCollapsed && (
        <div className={cx(styles.lowerContent, props.lowerContentFlush && styles.lowerContentFlush)}>
          { props.lowerContent }
        </div>
      )}
    </>
  );
};
