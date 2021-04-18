import * as React from 'react';
import { MenuRenderer } from './types';
import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';

export const Bp3MenuRenderer: MenuRenderer = props => {
  return (
    <Menu>
      {props.menu.childs.map((child, idx) =>
        typeof child === 'string' ? (
          <MenuDivider key={idx} />
        ) : (
          <MenuItem {...child} key={idx}>
            {child.childs && <Bp3MenuRenderer menu={{ childs: child.childs }} />}
          </MenuItem>
        )
      )}
    </Menu>
  );
};
