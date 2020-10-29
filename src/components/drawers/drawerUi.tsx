import cxs from 'cxs';
import React from 'react';

const styles = {
  container: cxs({
    backgroundColor: '#eee',
    height: '100%'
  }),
  card: cxs({
    backgroundColor: '#fff',
    borderRadius: '8px',
    margin: '16px',
    boxShadow: '0px 2px 3px 1px #ccc'
  }),
  cardTitle: cxs({
    fontSize: '14px',
    padding: '12px 20px 8px 20px',
  }),
  cardContent: cxs({
    padding: '4px 20px 12px 20px',
  }),
};

export const DrawerUi: {
  Container: React.FC,
  Card: React.FC<{
    title: string,
  }>
} = {
  Container: ({ children }) => <div children={children} className={styles.container} />,

  Card: ({ children, title }) => (
    <div className={styles.card}>
      <h1 className={styles.cardTitle}>
        { title }
      </h1>
      <div className={styles.cardContent}>
        { children }
      </div>
    </div>
  )
};
