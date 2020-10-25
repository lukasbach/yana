import * as React from 'react';
import { SettingsObject } from '../../../settings/types';
import { FormGroup, HTMLSelect, InputGroup } from '@blueprintjs/core';
import { useSettingsPageContext } from '../SettingsContext';

export const SettingsSelectInput: React.FC<{
  settingsKey: keyof SettingsObject,
  label: string,
  helperText?: string,
  labelInfo?: string,
  options: Array<{
    label: string,
    value: string,
  }>
}> = props => {
  const settings = useSettingsPageContext();
  const id = props.label.toLowerCase().replace(/\s/g, '_');
  console.log(settings.settings, props)

  return (
    <FormGroup
      helperText={props.helperText}
      label={props.label}
      labelInfo={props.labelInfo}
      labelFor={id}
    >
      <HTMLSelect
        large fill
        id={id}
        options={props.options}
        onChange={(e: any) => settings.changeSettings({ [props.settingsKey]: e.target.value })}
        value={settings.settings[props.settingsKey] as string}
      />
    </FormGroup>
  );
};
