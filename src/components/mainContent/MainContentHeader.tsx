import * as React from 'react';
import cxs from 'cxs';
import Color from 'color';
import { Button, EditableText, Icon, IconName } from '@blueprintjs/core';
import ago from 's-ago';
import { TagList } from './TagList';

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
    fontWeight: 400,
    fontSize: '32px',
    margin: 0,
    '> span': {
      margin: '2px 14px 0 0px'
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

export const MainContentHeader: React.FC<{
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
            { props.icon && <Icon icon={props.icon} color={props.iconColor} iconSize={32} /> }
            { props.title }
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
