import * as React from 'react';
import { SettingsSection } from '../layout/SettingsSection';
import { SettingsSwitchInput } from '../layout/SettingsSwitchInput';
import { SettingsClickable } from '../layout/SettingsClickable';
import { createPerformanceTestingWorkspace } from '../../../appdata/createPerformanceTestingWorkspace';
import { useAppData } from '../../../appdata/AppDataProvider';

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
    </div>
  );
};
