import * as React from 'react';
import { Button, ButtonGroup, Icon } from '@blueprintjs/core';
import { defaultTheme } from '../../../common/theming';

const COLORS = [defaultTheme.primaryColor, '#2ecc71', '#9b59b6', '#e67e22', '#e74c3c', '#34495e', '#f1c40f', '#1abc9c'];

export const ColorSelection: React.FC<{
  selectedColor?: string;
  onSelectColor: (color?: string) => void;
}> = props => {
  return (
    <ButtonGroup>
      {COLORS.map(col => (
        <Button
          key={col}
          icon={<Icon icon={'full-circle'} color={col} />}
          minimal
          active={col === props.selectedColor || (!props.selectedColor && col === defaultTheme.primaryColor)}
          onClick={() => props.onSelectColor(col)}
        />
      ))}
    </ButtonGroup>
  );
};
