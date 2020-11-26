import * as React from 'react';
import { Button, ButtonGroup, Icon } from '@blueprintjs/core';

const COLORS = [
  '#3498db',
  '#2ecc71',
  '#9b59b6',
  '#e67e22',
  '#e74c3c',
  '#34495e',
  '#f1c40f',
  '#1abc9c',
]

export const ColorSelection: React.FC<{
  selectedColor?: string,
  onSelectColor: (color?: string) => void,
}> = props => {

  return (
    <ButtonGroup>
      <Button
        icon={<Icon icon={'circle'} />}
        minimal
        active={!props.selectedColor}
        onClick={() => props.onSelectColor(undefined)}
      />
      { COLORS.map(col => (
        <Button
          key={col}
          icon={<Icon icon={'full-circle'} color={col} />}
          minimal
          active={col === props.selectedColor}
          onClick={() => props.onSelectColor(col)}
        />
      )) }
    </ButtonGroup>
  );
};
