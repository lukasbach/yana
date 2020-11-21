import * as React from 'react';
import { SettingsObject } from '../../../settings/types';
import { Button, ControlGroup, FormGroup, InputGroup, NumericInput } from '@blueprintjs/core';
import { useSettingsPageContext } from '../SettingsContext';

export const SettingsNumberInput: React.FC<{
  settingsKey: keyof SettingsObject,
  label: string,
  helperText?: string,
  labelInfo?: string,
  placeholder?: string,
  isFloat?: boolean,
  step?: number,
  min?: number,
  max?: number,
  divideFactor?: number,
  enabledTrigger?: keyof SettingsObject,
}> = props => {
  const settings = useSettingsPageContext();
  const id = props.label.toLowerCase().replace(/\s/g, '_');
  const val = settings.settings[props.settingsKey] as number;
  const divideFactor = props.divideFactor ?? 1;
  const disabled = props.enabledTrigger && !settings.settings[props.enabledTrigger];

  return (
    <FormGroup
      helperText={props.helperText}
      label={props.label}
      labelInfo={props.labelInfo}
      labelFor={id}
      disabled={disabled}
    >
      <ControlGroup className="bp3-numeric-input">
        <NumericInput
          fill
          id={id}
          placeholder={props.placeholder || props.label}
          defaultValue={Math.round((val / divideFactor) * 100) / 100}
          onValueChange={(val) => {
            settings.changeSettings({ [props.settingsKey]: val * divideFactor });
          }}
          disabled={disabled}
          stepSize={Math.round((props.step || 1) * 100 / divideFactor) / 100}
          majorStepSize={null}
          minorStepSize={null}
          clampValueOnBlur={true}
          min={props.min !== undefined ? props.min / divideFactor : undefined}
          max={props.max !== undefined ? props.max / divideFactor : undefined}
        />
      </ControlGroup>
    </FormGroup>
  );
};
