import * as React from 'react';
import { SideBarTreeItemUi } from './SideBarTreeItemUi';

export const UntruncateItem: React.FC<{
  itemCount: number,
  onClick: () => void,
  style?: React.CSSProperties,
}> = props => {
  return (
    <div style={props.style}>
      <SideBarTreeItemUi
        text={`Show ${props.itemCount} more items`}
        icon={'more'}
        onClick={props.onClick}
        isExpandable={false}
      >
        { props.children }
      </SideBarTreeItemUi>
    </div>
  );
};
