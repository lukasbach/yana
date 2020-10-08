import * as React from 'react';
import cxs from 'cxs';

const styles = {
  container: cxs({
    margin: '12px 16px 18px 16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0px 2px 3px 1px #bbb',
  })
};

export const DetailedListContainer: React.FC<{}> = props => {

  return (
    <div className={styles.container}>
      { props.children }
    </div>
  );
};
