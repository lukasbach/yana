import * as React from 'react';
import { SettingsObject } from '../../../settings/types';
import { FormGroup } from '@blueprintjs/core';
import { useSettingsPageContext } from '../SettingsContext';
import { ColorPickerInput } from '../../common/ColorPickerInput';
import Color from 'color';

export const SettingsColorInput: React.FC<{
  settingsKey: keyof SettingsObject;
  label: string;
  helperText?: string;
  labelInfo?: string;
}> = props => {
  const settings = useSettingsPageContext();
  const id = props.label.toLowerCase().replace(/\s/g, '_');

  return (
    <FormGroup helperText={props.helperText} label={props.label} labelInfo={props.labelInfo} labelFor={id}>
      <ColorPickerInput
        inputProps={{ id }}
        color={settings.settings[props.settingsKey] as string}
        onChange={color => {
          settings.changeSettings({ [props.settingsKey]: Color(color).hex() });
        }}
      />
    </FormGroup>
  );
};
