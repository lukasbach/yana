import * as React from 'react';
import { SettingsSection } from '../layout/SettingsSection';
import { SettingsSwitchInput } from '../layout/SettingsSwitchInput';
import { SettingsClickable } from '../layout/SettingsClickable';
import { createPerformanceTestingWorkspace } from '../../../appdata/createPerformanceTestingWorkspace';
import { useAppData } from '../../../appdata/AppDataProvider';
import { SettingsTextAreaInput } from '../layout/SettingsTextAreaInput';
import { remote } from 'electron';

export const DevSettings: React.FC<{}> = props => {
  const appData = useAppData();
  return (
    <div>
      <SettingsSection title="Devtools">
        <SettingsSwitchInput
          settingsKey={'devToolsOpen'}
          label={"Yana Devtools Sidebar open"}
        />
        <SettingsClickable
          title="Create performance testing workspace"
          subtitle="This will create a new workspace with *very* many items. This might take a very long time or crash the app."
          onClick={() => createPerformanceTestingWorkspace(appData)}
        />
      </SettingsSection>
      <SettingsSection title="Logging">
        <SettingsSwitchInput
          settingsKey={'devLoggerActive'}
          label={"Logging active"}
          helperText="Logging happens in the Chrome Devtools Console. Press CTRL+SHIFT+I to open."
        />
        <SettingsTextAreaInput
          settingsKey={'devLoggerWhitelist'}
          label={"Logging Whitelist"}
          helperText="If not empty, only components listed below may log to the console. One component name per line."
        />
        <SettingsTextAreaInput
          settingsKey={'devLoggerBlacklist'}
          label={"Logging Blacklist"}
          helperText="Components listed below may not log to the console. Overwrites whitelist. One component name per line."
        />
        <SettingsClickable
          title="Open Chrome Devtools"
          onClick={() => remote.getCurrentWindow().webContents.openDevTools()}
        />
      </SettingsSection>
    </div>
  );
};
