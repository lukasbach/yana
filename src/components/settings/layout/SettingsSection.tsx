import * as React from 'react';
import cxs from 'cxs';
import cx from 'classnames';
import { ResizeSensor } from '@blueprintjs/core';
import { useState } from 'react';

const styles = {
  container: cxs({
    display: 'flex',
    margin: '24px',
  }),
  narrowContainer: cxs({
    display: 'block',
  }),
  leftContainer: cxs({
    width: '200px',
    minWidth: '200px',
    '> h2': {
      margin: '24px 0 0 0',
      fontSize: '16px',
    },
  }),
  rightContainer: cxs({
    flexGrow: 1,
  }),
  card: cxs({
    margin: '12px 16px 18px 16px',
    padding: '24px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0px 2px 3px 1px #bbb',
  }),
};

const NARROW_WIDTH = 600;

export const SettingsSection: React.FC<{
  title: string;
}> = props => {
  const [narrow, setNarrow] = useState(false);

  return (
    <ResizeSensor
      onResize={entries => {
        if (narrow && entries[0].contentRect.width >= NARROW_WIDTH) {
          setNarrow(false);
        } else if (!narrow && entries[0].contentRect.width < NARROW_WIDTH) {
          setNarrow(true);
        }
      }}
    >
      <div
        className={cx(styles.container, narrow && styles.narrowContainer)}
        ref={r => setNarrow((r?.clientWidth || 0) < NARROW_WIDTH)}
      >
        <div className={styles.leftContainer}>
          <h2>{props.title}</h2>
        </div>
        <div className={styles.rightContainer}>
          <div className={styles.card}>{props.children}</div>
        </div>
      </div>
    </ResizeSensor>
  );
};
