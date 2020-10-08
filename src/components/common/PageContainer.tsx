import * as React from 'react';
import cxs from 'cxs';

const styles = {
  container: cxs({
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  }),
  content: cxs({
    flexGrow: 1,
    backgroundColor: 'rgb(240,240,240)',
    boxShadow: '0px 3px 4px -2px rgba(0,0,0,.2) inset',
    overflowY: 'auto',
    ' .ReactVirtualized__Grid__innerScrollContainer': {
      width: '100% !important',
      maxWidth: '100% !important',
    }
  }),
};

export const PageContainer: React.FC<{
  header: React.ReactNode;
}> = props => (
  <div className={styles.container}>
    { props.header }
    <div className={styles.content}>
      { props.children }
    </div>
  </div>
);
