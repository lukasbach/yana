import * as React from 'react';
import { Icon, InputGroup, Popover, HTMLInputProps, IInputGroupProps } from '@blueprintjs/core';
import { SketchPicker } from 'react-color';

export const ColorPickerInput: React.FC<{
  color: string,
  onChange: (newColor: string) => void,
  inputProps?: IInputGroupProps & HTMLInputProps,
}> = props => {

  return (
    <Popover
      content={(
        <SketchPicker
          color={props.color}
          onChangeComplete={col => props.onChange(col.hex)}
        />
      )}
    >
      <InputGroup
        value={props.color}
        leftIcon={<Icon icon={'symbol-square'} color={props.color} />}
        {...(props.inputProps || {})}
      />
    </Popover>
  );
};
