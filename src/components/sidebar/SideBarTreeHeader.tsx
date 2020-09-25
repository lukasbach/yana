import * as React from 'react';
import { DataItem } from '../../types';
import { Icon } from '@blueprintjs/core';
import cxs from 'cxs';
import cx from 'classnames';
import { useTheme } from '../../common/theming';
import Color from 'color';

const styles = {
  container: cxs({
    display: 'flex',
    padding: '12px 8px 2px 8px',
    color: '#fff',
    ':hover': {
      ' .add-container': {
        opacity: '1 !important'
      }
    }
  }),
  chevronContainer: cxs({
    paddingRight: '6px',
    cursor: 'pointer',
    ':hover': {
      color: '#fff'
    }
  }),
  titleContainer: cxs({
    flexGrow: 1,
    fontWeight: 'bolder',
    textTransform: 'uppercase',
    fontSize: '.8em',
    padding: '2px'
  }),
  addContainer: cxs({
    opacity: 0,
    transition: '.3s all ease',
    cursor: 'pointer',
    ':hover': {
      color: '#fff'
    }
  }),
}

export const SideBarTreeHeader: React.FC<{
  title: string;
  isExpanded: boolean;
  onChangeIsExpanded: (isExpanded: boolean) => void;
  masterItem?: DataItem;
}> = props => {
  const theme = useTheme();

  return (
    <div className={cx(
      styles.container,
      cxs({
        color: Color(theme.sidebarTextColor).lighten(.2).toString()
      })
    )}>
      <div
        className={styles.chevronContainer}
        onClick={() => props.onChangeIsExpanded(!props.isExpanded)}
      >
        <Icon
          icon={props.isExpanded ? 'chevron-down' : 'chevron-right'}
        />
      </div>
      <div className={styles.titleContainer}>
        { props.title }
      </div>
      <div className={cx(
        styles.addContainer,
        'add-container'
      )}>
        <Icon icon={'plus'} />
      </div>
    </div>
  );
};
