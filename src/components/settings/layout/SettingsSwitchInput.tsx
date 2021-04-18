import * as React from 'react';
import { SettingsObject } from '../../../settings/types';
import { FormGroup, InputGroup, Switch } from '@blueprintjs/core';
import { useSettingsPageContext } from '../SettingsContext';

export const SettingsSwitchInput: React.FC<{
  settingsKey: keyof SettingsObject;
  label: string;
  switchLabel?: string;
  helperText?: string;
  labelInfo?: string;
}> = props => {
  const settings = useSettingsPageContext();
  const id = props.label.toLowerCase().replace(/\s/g, '_');
  const checked = settings.settings[props.settingsKey] as boolean;

  return (
    <FormGroup helperText={props.helperText} label={props.label} labelInfo={props.labelInfo} labelFor={id}>
      <Switch
        id={id}
        label={props.switchLabel || (checked ? 'Enabled' : 'Disabled')}
        checked={checked}
        onChange={(e: any) => settings.changeSettings({ [props.settingsKey]: e.target.checked })}
      />
    </FormGroup>
  );
};
