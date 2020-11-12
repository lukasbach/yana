import * as React from 'react';
import cxs from 'cxs';
import { DataItem, DataItemKind } from '../../types';
import { ResultItem } from './ResultItem';
import ago from 's-ago';

const styles = {
  container: cxs({
    height: '100%'
  }),
}

export const SelectedItems: React.FC<{
  items: DataItem[],
  onClickItem: (item: DataItem) => void,
}> = props => {
  return (
    <div className={styles.container}>
      {
        props.items.map(item => (
          <ResultItem
            key={item.id}
            icon={(item.icon || (item.kind === DataItemKind.Collection ? 'folder-open' : 'document')) as any}
            title={item.name}
            meta={ago(new Date(item.lastChange))}
            onClick={() => props.onClickItem(item)}
            selected={true}
          />
        ))
      }
    </div>
  );
};
