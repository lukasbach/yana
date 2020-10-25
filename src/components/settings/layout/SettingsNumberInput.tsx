import * as React from 'react';
import { SettingsObject } from '../../../settings/types';
import { Button, ControlGroup, FormGroup, InputGroup } from '@blueprintjs/core';
import { useSettingsPageContext } from '../SettingsContext';
import { ButtonGroup } from '@atlaskit/button';

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
}> = props => {
  const settings = useSettingsPageContext();
  const id = props.label.toLowerCase().replace(/\s/g, '_');
  const val = settings.settings[props.settingsKey] as number;

  return (
    <FormGroup
      helperText={props.helperText}
      label={props.label}
      labelInfo={props.labelInfo}
      labelFor={id}
    >
      <ControlGroup className="bp3-numeric-input">
        <InputGroup
          fill
          id={id}
          type="string"
          placeholder={props.placeholder || props.label}
          value={'' + val}
          onChange={(e: any) => {
            let newValue = (props.isFloat ? parseFloat : parseInt)(e.target.value);
            if (props.min) newValue = Math.max(props.min, newValue);
            if (props.max) newValue = Math.min(props.max, newValue);
            settings.changeSettings({ [props.settingsKey]: newValue });
          }}
          formAction="Test"
        />
        <div className="bp3-button-group bp3-vertical bp3-fixed">
          <Button
            icon="chevron-up"
            onClick={() => {
              let newValue = val + (props.step || 1)
              if (props.min) newValue = Math.max(props.min, newValue);
              if (props.max) newValue = Math.min(props.max, newValue);
              settings.changeSettings({ [props.settingsKey]: newValue });
            }}
          />
          <Button
            icon="chevron-down"
            onClick={() => {
              let newValue = val - (props.step || 1)
              if (props.min) newValue = Math.max(props.min, newValue);
              if (props.max) newValue = Math.min(props.max, newValue);
              settings.changeSettings({ [props.settingsKey]: newValue });
            }}
          />
        </div>
      </ControlGroup>
    </FormGroup>
  );
};
