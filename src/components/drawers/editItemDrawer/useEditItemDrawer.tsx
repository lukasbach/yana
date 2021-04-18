import React, { useState } from 'react';
import { EditItemDrawer } from './EditItemDrawer';

export const useEditItemDrawer = (itemId: string) => {
  const [isOpen, setIsOpen] = useState(false);

  return {
    EditItemDrawer: () => <EditItemDrawer isOpen={isOpen} onSetIsOpen={setIsOpen} itemId={itemId} />,
    onOpenEditItemDrawer: () => setIsOpen(true),
  };
};
