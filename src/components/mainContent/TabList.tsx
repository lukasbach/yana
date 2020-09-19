import * as React from 'react';
import { useMainContentContext } from './context';
import cxs from 'cxs';
import Color from 'color';
import { Icon } from '@blueprintjs/core';
import cx from 'classnames';
import { useTheme } from '../../common/theming';

const styles = {
  tabsContainer: cxs({
    display: 'flex',
    borderBottom: '1px solid #ccc'
  }),
  tabContainer: cxs({
    borderRight: '1px solid #ccc',
    padding: '8px 12px 5px 12px',
    cursor: 'pointer',
    display: 'flex',
    borderBottom: '3px solid transparent',
    ':hover': {
      backgroundColor: Color('#fff').darken(.1).toString()
    }
  }),
  activeTabContainer: cxs({
    fontWeight: 'bold',
    backgroundColor: Color('#fff').darken(.15).toString() + ' !important'
  }),
  iconContainer: cxs({
    color: Color('#fff').darken(.4).toString(),
    marginRight: '8px',
  }),
  tabTitleContainer: cxs({
    color: Color('#fff').darken(.8).toString()
  }),
  closeContainer: cxs({
    color: Color('#fff').darken(.4).toString(),
    marginLeft: '8px',
    ':hover': {
      color: '#000'
    }
  })
};

export const TabList: React.FC<{}> = props => {
  const mainContent = useMainContentContext();
  const theme = useTheme();

  return (
    <div className={styles.tabsContainer}>
      {
        mainContent.tabs.map((tab, id) => (
          <div
            className={cx(
              styles.tabContainer,
              mainContent.openTabId === id && styles.activeTabContainer,
              mainContent.openTabId === id && cxs({ borderBottomColor: theme.primaryColor })
            )}
            onClick={() => mainContent.activateTab(id)}
          >
            <div className={styles.iconContainer}>
              <Icon icon={'column-layout'} />
            </div>
            <div className={styles.tabTitleContainer}>
              { tab.dataItem.name }
            </div>
            <div
              className={styles.closeContainer}
              onClick={() => mainContent.closeTab(id)}
            >
              <Icon icon={'cross'} />
            </div>
          </div>
        ))
      }
    </div>
  );
};
