import * as React from 'react';
import cxs from 'cxs';
import cx from 'classnames';
import { Checkbox, Icon, IconName, MaybeElement } from '@blueprintjs/core';
import { useTheme } from '../../common/theming';
import { CSSProperties, useState } from 'react';

const META_CONTAINER_CLASS = '__meta_container';
export const OVERLAY_SEARCH_ITEM_HEIGHT = 42;

const styles = {
  container: cxs({
    position: 'relative',
    display: 'flex',
    color: 'white',
    borderRadius: '12px',
    height: `${OVERLAY_SEARCH_ITEM_HEIGHT}px`,
    padding: '12px 18px',
    marginBottom: '2px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'white',
      color: 'black'
    },
    [`:hover > .${META_CONTAINER_CLASS}`]: {
      color: 'rgba(100, 100, 100)'
    }
  }),
  containerSelected: cxs({
    backgroundColor: 'white',
    color: 'black',
    [` .${META_CONTAINER_CLASS}`]: {
      color: 'rgba(100, 100, 100)'
    }
  }),
  selectedContainer: cxs({
    position: 'absolute',
    top: '-6px',
    right: '-8px',
  }),
  iconContainer: cxs({}),
  titleContainer: cxs({
    flexGrow: 1,
    margin: '0 0 0 16px',
  }),
  metaContainer: cxs({
    color: 'rgba(160, 160, 160)'
  })
}

export const ResultItem: React.FC<{
  selected?: boolean,
  icon: IconName | MaybeElement,
  title: string,
  meta: string,
  onClick?: () => void,
  key: string,
  containerStyle?: CSSProperties
}> = props => {
  const theme = useTheme();
  const [hover, setHover] = useState(false);

  return (
    <div
      className={cx(styles.container, props.selected && styles.containerSelected)}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      onClick={props.onClick}
      key={props.key}
      style={props.containerStyle}
    >
      { props.selected && (
        <div className={styles.selectedContainer}>
          <Icon icon={ !hover ? 'tick' : 'cross' } iconSize={36} color={theme.primaryColor} />
        </div>
      )}
      <div className={styles.iconContainer}>
        <Icon icon={ props.icon } iconSize={16} />
      </div>
      <div className={styles.titleContainer}>
        { props.title }
      </div>
      <div className={styles.metaContainer + ' ' + META_CONTAINER_CLASS}>
        { props.meta }
      </div>
    </div>
  );
};
