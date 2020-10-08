import * as React from 'react';
import cxs from 'cxs';
import Color from 'color';
import { Icon, IconName } from '@blueprintjs/core';

const styles = {
  container: cxs({
    margin: '56px 32px 16px 32px',
    display: 'flex'
  }),
  leftContainer: cxs({
    flexGrow: 1
  }),
  rightContainer: cxs({
    textAlign: 'right',
    '> div': {
      marginBottom: '4px',
    }
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
  })
};

export const PageHeader: React.FC<{
  title: string | React.ReactNode;
  icon?: IconName;
  iconColor?: string;
  titleSubtext?: string | React.ReactNode;
  rightContent?: React.ReactNode;
  lowerContent?: React.ReactNode;
}> = props => {

  return (
    <>
      <div className={styles.container}>
        <div className={styles.leftContainer}>
          <h1 className={styles.title}>
            <div className={styles.titleInner}>
              { props.icon && <Icon icon={props.icon} color={props.iconColor} iconSize={32} /> }
              { props.title }
            </div>
          </h1>
          <p className={styles.titleSubtext}>
            { props.titleSubtext }
          </p>
        </div>
        <div className={styles.rightContainer}>
          { props.rightContent }
        </div>
      </div>
      { props.lowerContent && (
        <div className={styles.lowerContent}>
          { props.lowerContent }
        </div>
      )}
    </>
  );
};
