import * as React from 'react';
import { SettingsObject } from '../../../settings/types';
import { FormGroup, InputGroup, TextArea } from '@blueprintjs/core';
import { useSettingsPageContext } from '../SettingsContext';

export const SettingsTextAreaInput: React.FC<{
  settingsKey: keyof SettingsObject,
  label: string,
  helperText?: string,
  labelInfo?: string,
  placeholder?: string,
}> = props => {
  const settings = useSettingsPageContext();
  const id = props.label.toLowerCase().replace(/\s/g, '_');

  return (
    <FormGroup
      helperText={props.helperText}
      label={props.label}
      labelInfo={props.labelInfo}
      labelFor={id}
    >
      <TextArea
        id={id}
        placeholder={props.placeholder || props.label}
        value={settings.settings[props.settingsKey] as string}
        onChange={(e: any) => settings.changeSettings({ [props.settingsKey]: e.target.value })}
      />
    </FormGroup>
  );
};
