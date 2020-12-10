import * as React from 'react';
import { DataItem } from '../../types';
import { Icon, Popover } from '@blueprintjs/core';
import cxs from 'cxs';
import cx from 'classnames';
import { useTheme } from '../../common/theming';
import Color from 'color';
import { TreeAddIconContextMenu } from '../menus/TreeAddIconContextMenu';
import { useEffect, useState } from 'react';
import { useMainContentContext } from '../mainContent/context';
import { useDataInterface } from '../../datasource/DataInterfaceContext';
import { Bp3MenuRenderer } from '../menus/Bp3MenuRenderer';
import { SpotlightTarget } from '@atlaskit/onboarding';
import { useStoredStucture } from '../../datasource/useStoredStructure';

const styles = {
  container: cxs({
    display: 'flex',
    padding: '12px 8px 2px 8px',
    color: '#fff',
  }),
  clickableContainer: cxs({
    display: 'flex',
    flexGrow: 1,
    cursor: 'pointer',
  }),
  chevronContainer: cxs({
    paddingRight: '6px',
  }),
  titleContainer: cxs({
    flexGrow: 1,
    fontWeight: 'bolder',
    textTransform: 'uppercase',
    fontSize: '.8em',
    padding: '2px',
  }),
  addContainer: cxs({
    transition: '.3s all ease',
    cursor: 'pointer',
    ':hover': {
      color: '#fff'
    }
  }),
}

export const SideBarTreeHeader: React.FC<{
  title: string;
  onCreatedItem?: (item: DataItem) => void;
  onChangeIsExpanded?: (isExpanded: boolean) => void;
  masterItem?: DataItem;
}> = props => {
  const theme = useTheme();
  const mainContent = useMainContentContext();
  const dataInterface = useDataInterface();
  const [isExpanded, setIsExpanded] = useStoredStucture(
    'sessionSidebarHeader_' + props.title.toLocaleLowerCase().replace(/\s/g, ''),
    () => {},
    true,
    10000
  );
  useEffect(() => props.onChangeIsExpanded?.(isExpanded), [isExpanded]);

  const hoverEffectClass = cxs({
    ':hover': {
      color: Color(theme.sidebarColor).isDark() ? '#fff' : '#000'
    },
  });

  return (
    <div className={cx(
      styles.container,
      cxs({
        color: Color(theme.sidebarTextColor).lighten(.2).toString()
      })
    )}>
      <div
        className={cx(
          styles.clickableContainer,
          hoverEffectClass
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.chevronContainer}>
          <Icon
            icon={isExpanded ? 'chevron-down' : 'chevron-right'}
          />
        </div>
        <div className={styles.titleContainer}>
          { props.title }
        </div>
      </div>
      { props.masterItem && (
        <SpotlightTarget name="sidebar-new-note">
          <Popover
            content={(
              <TreeAddIconContextMenu
                item={props.masterItem}
                mainContent={mainContent}
                dataInterface={dataInterface}
                renderer={Bp3MenuRenderer}
                onCreatedItem={props.onCreatedItem}
              />
            )}
            position={'bottom-right'}
            minimal
          >
              <div className={cx(styles.addContainer, hoverEffectClass)}>
                <Icon icon={'plus'} />
              </div>
          </Popover>
        </SpotlightTarget>
      )}
    </div>
  );
};
