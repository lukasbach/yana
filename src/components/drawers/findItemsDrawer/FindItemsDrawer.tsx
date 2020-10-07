import * as React from 'react';
import { Drawer } from '@blueprintjs/core';
import { IconName } from '@blueprintjs/icons';
import { DataItem, SearchQuery } from '../../../types';
import { SearchView } from '../../mainContent/searchView/SearchView';

export const FindItemsDrawer: React.FC<{
  title: string,
  icon: IconName,
  hiddenSearch: SearchQuery,
  isOpen: boolean,
  onSetIsOpen: (open: boolean) => void,
  onClickItem: (item: DataItem) => void,
}> = props => {
  return (
    <Drawer
      isOpen={props.isOpen}
      portalClassName="drawer-portal-container"
      onClose={() => props.onSetIsOpen(false)}
      size={Drawer.SIZE_SMALL}
      title="Editing Item"
    >
      <SearchView
        title={props.title}
        icon={props.icon}
        hiddenSearch={props.hiddenSearch}
        defaultSearch={{}}
        onClickItem={props.onClickItem}
      />
    </Drawer>
  );
};
