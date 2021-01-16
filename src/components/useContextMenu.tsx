import React, { DOMAttributes, useCallback } from 'react';
import { ContextMenu } from '@blueprintjs/core';

export const useContextMenu = (menu?: JSX.Element) => {
  const elementProps: DOMAttributes<any> = {
    onContextMenu: e => {
      if (menu) {
        e.stopPropagation();
        e.preventDefault();
        ContextMenu.show(menu, { left: e.clientX, top: e.clientY });
      }
    }
  };
  return elementProps;
}
