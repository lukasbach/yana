import * as React from 'react';
import { SettingsSection } from '../layout/SettingsSection';
import { SettingsSwitchInput } from '../layout/SettingsSwitchInput';

export const DevSettings: React.FC<{}> = props => {
  return (
    <div>
      <SettingsSection title="Devtools">
        <SettingsSwitchInput
          settingsKey={'devToolsOpen'}
          label={"Yana Devtools Sidebar open"}
        />
      </SettingsSection>
    </div>
  );
};
