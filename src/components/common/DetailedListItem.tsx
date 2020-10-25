import * as React from 'react';
import cxs from 'cxs';
import cx from 'classnames';
import { ButtonGroup, Icon, IconName } from '@blueprintjs/core';

const styles = {
  container: cxs({
    display: 'flex',
    transition: '.07s all ease',
    padding: '12px 24px',
    ':hover': {
      backgroundColor: '#eee',
      ' .buttongroup': {
        opacity: 1
      }
    }
  }),
  containerHover: cxs({
    cursor: 'pointer',
  }),
  iconContainer: cxs({
    paddingRight: '16px'
  }),
  textContainer: cxs({
    flexGrow: 1,
  }),
  title: cxs({
    margin: 0,
    fontSize: '16px'
  }),
  subtitle: cxs({
    color: '#555'
  }),
  rightContainer: cxs({
    position: 'relative'
  }),
  buttonGroupContainer: cxs({
    position: 'absolute',
    top: '-20px',
    right: 0,
    opacity: 0,
    transition: '.1s all ease',
    backgroundColor: '#fff',
    borderRadius: '8px'
  }),
  rightText: cxs({}),
};

export const DetailedListItem: React.FC<{
  icon?: IconName,
  title: string,
  subtitle?: string,
  rightText?: string,
  actionButtons?: React.ReactNode,
  onClick?: () => void,
}> = props => {

  return (
    <div className={cx(styles.container, props.onClick && styles.containerHover)} onClick={props.onClick}>
      { props.icon && (
        <div className={styles.iconContainer}>
          <Icon icon={props.icon} iconSize={32} />
        </div>
      ) }
      <div className={styles.textContainer}>
        <h2 children={props.title} className={styles.title} />
        { props.subtitle && <p children={props.subtitle} className={styles.subtitle} /> }
      </div>
      <div className={styles.rightContainer}>
        <div className={cx(styles.buttonGroupContainer, 'buttongroup')}>
          { props.actionButtons && (
            <ButtonGroup>
              { props.actionButtons }
            </ButtonGroup>
          )}
        </div>
        { props.rightText && <p children={props.rightText} className={styles.rightText} /> }
      </div>
    </div>
  );
};
