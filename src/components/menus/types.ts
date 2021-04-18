import { IMenuItemProps } from '@blueprintjs/core';
import * as React from 'react';

export interface MenuDefinition {
  childs: Array<MenuItemDefinition | 'divider'>;
}

export interface MenuItemDefinition extends IMenuItemProps {
  childs?: Array<MenuItemDefinition | 'divider'>;
}

export type MenuRenderer = React.FC<{
  menu: MenuDefinition;
}>;
