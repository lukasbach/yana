import * as React from 'react';
import cxs from 'cxs';
import cx from 'classnames';

const styles = {
  container: cxs({
    maxHeight: '170px',
    overflowY: 'auto',
    overflowX: 'hidden',
    marginBottom: '16px',
  }),
  containerGrow: cxs({
    flexGrow: 1,
    maxHeight: 'none'
  })
}

export const SeachItemsContainer: React.FC<{
  grow?: boolean
}> = props => {

  return (
    <div className={cx(styles.container, props.grow && styles.containerGrow)}>
      { props.children }
    </div>
  );
};
