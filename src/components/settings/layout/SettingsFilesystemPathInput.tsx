import * as React from 'react';
import { SettingsObject } from '../../../settings/types';
import { Button, ControlGroup, FormGroup, InputGroup } from '@blueprintjs/core';
import { useSettingsPageContext } from '../SettingsContext';
import { remote } from 'electron';

export const SettingsFilesystemPathInput: React.FC<{
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
      <ControlGroup fill>
        <InputGroup
          fill
          id={id}
          placeholder={props.placeholder || props.label}
          value={settings.settings[props.settingsKey] as string}
          onChange={(e: any) => settings.changeSettings({ [props.settingsKey]: e.target.value })}
        />
        <Button
          outlined
          rightIcon="chevron-right"
          onClick={async () => {
            const result = await remote.dialog.showOpenDialog({
              defaultPath: settings.settings[props.settingsKey] as string,
              buttonLabel: 'Choose',
              title: 'Choose location for automatic backups',
              properties: ['createDirectory', 'openDirectory']
            });
            if (result.canceled) return;
            settings.changeSettings({ [props.settingsKey]: result.filePaths[0] });
          }}
        >
          Choose&nbsp;path...
        </Button>
      </ControlGroup>
    </FormGroup>
  );
};
